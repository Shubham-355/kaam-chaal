import prisma from '../config/database.js';
import apiService from '../services/apiService.js';
import dataService from '../services/dataService.js';

// Get states and financial years from environment or use defaults
const getStatesFromEnv = () => {
  const syncStates = process.env.SYNC_STATES?.trim();
  if (!syncStates) return null; // null means sync all states
  return syncStates.split(',').map(s => s.trim()).filter(s => s);
};

const getFinYearsFromEnv = () => {
  const finYears = process.env.SYNC_FIN_YEARS?.trim();
  if (!finYears) return ['2024-2025']; // Default to current year
  return finYears.split(',').map(y => y.trim()).filter(y => y);
};

export async function syncDataJob(specificStates = null, specificFinYears = null) {
  const startTime = new Date();
  let totalRecordsAdded = 0;
  let totalRecordsUpdated = 0;

  const syncLog = await prisma.apiSyncLog.create({
    data: {
      syncType: 'full',
      status: 'in_progress',
      startedAt: startTime,
    },
  });

  try {
    const states = specificStates || getStatesFromEnv();
    const finYears = specificFinYears || getFinYearsFromEnv();

    if (!states) {
      console.log('Syncing data for ALL states...');
      // Fetch all states by not filtering
      for (const finYear of finYears) {
        console.log(`\nFetching data for financial year: ${finYear}`);
        const records = await apiService.fetchAllPages(null, finYear);
        console.log(`Fetched ${records.length} records from API`);
        
        const { added, updated } = await processRecords(records);
        totalRecordsAdded += added;
        totalRecordsUpdated += updated;
      }
    } else {
      console.log(`Syncing data for states: ${states.join(', ')}`);
      for (const state of states) {
        for (const finYear of finYears) {
          console.log(`\nProcessing ${state} - ${finYear}...`);
          const records = await apiService.fetchAllPages(state, finYear);
          console.log(`Fetched ${records.length} records from API`);
          
          const { added, updated } = await processRecords(records);
          totalRecordsAdded += added;
          totalRecordsUpdated += updated;
        }
      }
    }

    await prisma.apiSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'success',
        recordsAdded: totalRecordsAdded,
        recordsUpdated: totalRecordsUpdated,
        completedAt: new Date(),
      },
    });

    console.log(`\nSync completed: ${totalRecordsAdded} added, ${totalRecordsUpdated} updated`);
  } catch (error) {
    console.error('Sync failed:', error);

    await prisma.apiSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      },
    });
    
    throw error;
  }
}

async function processRecords(records) {
  let recordsAdded = 0;
  let recordsUpdated = 0;

  for (const record of records) {
    try {
      const district = await dataService.upsertDistrict(record);
      
      const existing = await prisma.districtRecord.findUnique({
        where: {
          districtId_finYear_month: {
            districtId: district.id,
            finYear: record.fin_year,
            month: record.month,
          },
        },
      });

      await dataService.upsertDistrictRecord(district.id, record);

      if (existing) {
        recordsUpdated++;
      } else {
        recordsAdded++;
      }
    } catch (error) {
      console.error(`Error processing record for district ${record.district_name}: ${error.message}`);
    }
  }

  return { added: recordsAdded, updated: recordsUpdated };
}
