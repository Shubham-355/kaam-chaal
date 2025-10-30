import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/district/:districtCode/summary', async (req, res, next) => {
  try {
    const { districtCode } = req.params;
    const { finYear } = req.query;

    // Check if district exists
    const district = await prisma.district.findUnique({
      where: { districtCode },
    });

    if (!district) {
      return res.status(404).json({
        success: false,
        error: { message: `District with code ${districtCode} not found` },
      });
    }

    const where = { district: { districtCode } };
    if (finYear) where.finYear = finYear;

    const records = await prisma.districtRecord.findMany({
      where,
      include: { district: true },
    });

    // Handle case where no records exist
    if (!records || records.length === 0) {
      return res.json({
        success: true,
        data: {
          totalEmployment: 0,
          totalExpenditure: 0,
          avgWageRate: 0,
          worksCompleted: 0,
          district,
        },
      });
    }

    const summary = {
      totalEmployment: records.reduce((sum, r) => sum + (Number(r.totalHouseholdsWorked) || 0), 0),
      totalExpenditure: records.reduce((sum, r) => sum + (Number(r.totalExpenditure) || 0), 0),
      avgWageRate: records.reduce((sum, r) => sum + (r.avgWageRate || 0), 0) / records.length || 0,
      worksCompleted: records.reduce((sum, r) => sum + (Number(r.totalWorksCompleted) || 0), 0),
      district,
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

export default router;
