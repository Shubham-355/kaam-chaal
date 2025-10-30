import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/district/:districtCode/summary', async (req, res, next) => {
  try {
    const { districtCode } = req.params;
    const { finYear } = req.query;

    const where = { district: { districtCode } };
    if (finYear) where.finYear = finYear;

    const records = await prisma.districtRecord.findMany({
      where,
      include: { district: true },
    });

    const summary = {
      totalEmployment: records.reduce((sum, r) => sum + (Number(r.totalHouseholdsWorked) || 0), 0),
      totalExpenditure: records.reduce((sum, r) => sum + (Number(r.totalExpenditure) || 0), 0),
      avgWageRate: records.reduce((sum, r) => sum + (r.avgWageRate || 0), 0) / records.length,
      worksCompleted: records.reduce((sum, r) => sum + (Number(r.totalWorksCompleted) || 0), 0),
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

export default router;
