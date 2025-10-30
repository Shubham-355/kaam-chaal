import express from 'express';
import dataService from '../services/dataService.js';

const router = express.Router();

router.get('/states', async (req, res, next) => {
  try {
    const states = await dataService.getStates();
    res.json({ success: true, data: states });
  } catch (error) {
    next(error);
  }
});

router.get('/by-state/:state', async (req, res, next) => {
  try {
    const { state } = req.params;
    const districts = await dataService.getDistrictsByState(state);
    res.json({ success: true, data: districts });
  } catch (error) {
    next(error);
  }
});

router.get('/:districtCode', async (req, res, next) => {
  try {
    const { districtCode } = req.params;
    const { finYear } = req.query;
    
    // First check if district exists
    const districtExists = await dataService.getDistrictByCode(districtCode);
    if (!districtExists) {
      return res.status(404).json({ 
        success: false, 
        error: { message: `District with code ${districtCode} not found` } 
      });
    }
    
    const data = await dataService.getDistrictData(districtCode, finYear);
    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

export default router;
