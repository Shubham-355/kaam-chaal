import prisma from '../config/database.js';
import apiService from '../services/apiService.js';
import dataService from '../services/dataService.js';

export async function syncDataJob(state = 'MAHARASHTRA') {
  const startTime = new Date();
  let recordsAdded = 0;
  let recordsUpdated = 0;

  const syncLog = await prisma.apiSyncLog.create({
    data: {
      syncType: 'full',
      status: 'in_progress',
      startedAt: startTime,
    },
  });

  try {
    console.log(`Starting data sync for ${state}...`);

    const records = await apiService.fetchAllPages(state);
    console.log(`Fetched ${records.length} records from API`);

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
        console.error(`Error processing record: ${error.message}`);
      }
    }

    await prisma.apiSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'success',
        recordsAdded,
        recordsUpdated,
        completedAt: new Date(),
      },
    });

    console.log(`Sync completed: ${recordsAdded} added, ${recordsUpdated} updated`);
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
  }
}
