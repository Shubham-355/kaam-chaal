import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

class ChatbotService {
  async generateResponse(userMessage, context = {}) {
    try {
      const systemPrompt = `You are a helpful assistant for the MGNREGA Tracker application. 
MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) is India's largest employment guarantee scheme.

Your role:
- Answer questions about MGNREGA, employment data, wages, and works
- Help users understand district performance metrics
- Explain data in simple terms for rural populations
- Be concise and friendly
- Support both English and Hindi contexts
- Format your responses with bullet points (*), bold text (**text**), and headers (##) when appropriate

Current context:
${context.district ? `User is viewing: ${context.district.districtName}, ${context.district.stateName}` : 'User is on the home page'}
${context.language ? `Preferred language: ${context.language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}` : ''}

User question: ${userMessage}

Please provide a clear, well-formatted response using markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
      });

      return response.text;
    } catch (error) {
      console.error('Chatbot error:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  async generateContextualHelp(context) {
    try {
      const prompt = `Based on this MGNREGA data context, provide 3 helpful quick insights or suggestions in bullet points:
${JSON.stringify(context, null, 2)}

Keep it brief and actionable. Use bullet points with * for formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Context help error:', error);
      return null;
    }
  }
}

export default new ChatbotService();
