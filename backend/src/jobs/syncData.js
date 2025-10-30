import prisma from '../config/database.js';
import apiService from '../services/apiService.js';
import dataService from '../services/dataService.js';

// Get financial years from environment or use defaults
const getFinYearsFromEnv = () => {
  const finYears = process.env.SYNC_FIN_YEARS?.trim();
  if (!finYears) return ['2024-2025']; // Default to current year
  return finYears.split(',').map(y => y.trim()).filter(y => y);
};

// Sort years in reverse chronological order
const sortYearsReverse = (years) => {
  return years.sort((a, b) => {
    const yearA = parseInt(a.split('-')[0]);
    const yearB = parseInt(b.split('-')[0]);
    return yearB - yearA; // Reverse order (2024-25 first)
  });
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
    // Get all financial years and sort in reverse order
    const finYears = specificFinYears || getFinYearsFromEnv();
    const sortedFinYears = sortYearsReverse([...finYears]);
    
    console.log(`\n📅 Years: ${sortedFinYears.length} (${sortedFinYears[0]} → ${sortedFinYears[sortedFinYears.length - 1]})`);

    // Fetch all unique states from the database or API
    let allStates = [];
    
    if (specificStates && specificStates.length > 0) {
      allStates = specificStates;
      console.log(`🌏 States: ${allStates.length} specified`);
    } else {
      console.log('🌏 Fetching all states...');
      
      // Get existing states from database
      const existingStates = await prisma.district.findMany({
        select: { stateName: true },
        distinct: ['stateName'],
        orderBy: { stateName: 'asc' },
      });
      
      if (existingStates.length > 0) {
        allStates = existingStates.map(s => s.stateName);
        console.log(`   Found ${allStates.length} states in database`);
      } else {
        // If no states in database, fetch from API for the latest year
        const sampleRecords = await apiService.fetchAllPages(null, sortedFinYears[0]);
        const stateSet = new Set(sampleRecords.map(r => r.state_name));
        allStates = Array.from(stateSet).sort();
        console.log(`   Found ${allStates.length} states from API`);
      }
    }

    console.log(`📊 Total combinations: ${allStates.length * sortedFinYears.length}\n`);

    // Process each year, then all states within that year
    for (let yearIndex = 0; yearIndex < sortedFinYears.length; yearIndex++) {
      const finYear = sortedFinYears[yearIndex];
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📅 Year ${yearIndex + 1}/${sortedFinYears.length}: ${finYear}`);
      console.log(`${'='.repeat(60)}`);

      let yearAdded = 0;
      let yearUpdated = 0;

      // Process all states for this year
      for (let stateIndex = 0; stateIndex < allStates.length; stateIndex++) {
        const state = allStates[stateIndex];
        
        // Only log every 5th state to reduce clutter
        if (stateIndex % 5 === 0 || stateIndex === allStates.length - 1) {
          process.stdout.write(`\r🌍 [${stateIndex + 1}/${allStates.length}] ${state.padEnd(20)} `);
        }
        
        try {
          const records = await apiService.fetchAllPages(state, finYear);
          
          if (records.length > 0) {
            const { added, updated } = await processRecords(records);
            totalRecordsAdded += added;
            totalRecordsUpdated += updated;
            yearAdded += added;
            yearUpdated += updated;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`\n   ✗ Error: ${state} - ${error.message}`);
          continue;
        }
      }
      
      console.log(`\n✓ ${finYear}: +${yearAdded} ~${yearUpdated} (Total: ${totalRecordsAdded}/${totalRecordsUpdated})`);
    }

    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationMin = Math.floor(durationMs / 60000);
    const durationSec = Math.floor((durationMs % 60000) / 1000);

    await prisma.apiSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'success',
        recordsAdded: totalRecordsAdded,
        recordsUpdated: totalRecordsUpdated,
        completedAt: endTime,
      },
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ SYNC COMPLETED`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Added: ${totalRecordsAdded} | Updated: ${totalRecordsUpdated}`);
    console.log(`⏱️  Duration: ${durationMin}m ${durationSec}s`);
    console.log(`${'='.repeat(60)}\n`);
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);

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
      // Silent error handling to avoid log spam
      continue;
    }
  }

  return { added: recordsAdded, updated: recordsUpdated };
}

