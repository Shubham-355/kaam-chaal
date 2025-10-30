import express from 'express';
import dataService from '../services/dataService.js';

const router = express.Router();

// Helper function to convert BigInt to string recursively
const serializeBigInt = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item));
  }
  
  if (typeof obj === 'object') {
    const serialized = {};
    for (const key in obj) {
      serialized[key] = serializeBigInt(obj[key]);
    }
    return serialized;
  }
  
  return obj;
};

router.get('/states', async (req, res, next) => {
  try {
    const states = await dataService.getStates();
    res.json({ success: true, data: serializeBigInt(states) });
  } catch (error) {
    next(error);
  }
});

router.get('/by-state/:state', async (req, res, next) => {
  try {
    const { state } = req.params;
    const districts = await dataService.getDistrictsByState(state);
    res.json({ success: true, data: serializeBigInt(districts) });
  } catch (error) {
    next(error);
  }
});

router.get('/:districtCode', async (req, res, next) => {
  try {
    const { districtCode } = req.params;
    const { finYear } = req.query;
    
    const districtExists = await dataService.getDistrictByCode(districtCode);
    if (!districtExists) {
      return res.status(404).json({ 
        success: false, 
        error: { message: `District with code ${districtCode} not found` } 
      });
    }
    
    const data = await dataService.getDistrictData(districtCode, finYear);
    
    // Transform to expected format with records array
    const response = {
      success: true,
      data: {
        records: serializeBigInt(data || [])
      }
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
