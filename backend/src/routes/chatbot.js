import express from 'express';
import chatbotService from '../services/chatbotService.js';

const router = express.Router();

router.post('/chat', async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required' }
      });
    }

    const result = await chatbotService.generateResponse(message, context || {});

    res.json({
      success: true,
      data: {
        response: result.text,
        action: result.action,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/help', async (req, res, next) => {
  try {
    const { context } = req.body;
    const help = await chatbotService.generateContextualHelp(context || {});

    res.json({
      success: true,
      data: { help }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
