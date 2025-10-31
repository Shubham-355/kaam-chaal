import { GoogleGenAI } from "@google/genai";
import dataService from './dataService.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

class ChatbotService {
  async generateResponse(userMessage, context = {}) {
    try {
      // Detect action intents with enhanced matching
      const action = await this.detectIntent(userMessage, context);
      
      const systemPrompt = `You are a helpful assistant for the MGNREGA Tracker application. 
MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) is India's largest employment guarantee scheme.

Your role:
- Answer questions about MGNREGA, employment data, wages, and works
- Help users navigate to specific districts or states
- Help users understand district performance metrics
- Explain data in simple terms for rural populations
- Be concise and friendly
- Support both English and Hindi contexts
- Format your responses with bullet points (*), bold text (**text**), and headers (##) when appropriate

Current context:
${context.district ? `User is viewing: ${context.district.districtName}, ${context.district.stateName}` : 'User is on the home page'}
${context.language ? `Preferred language: ${context.language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}` : ''}

${action ? `IMPORTANT: The user wants to ${action.type === 'navigate' ? 'view data for' : action.type} ${action.target === 'district' ? action.district?.districtName : action.target === 'state' ? action.state?.stateName : action.target}. Acknowledge this action naturally and tell them you're taking them there. Keep it brief and conversational.` : ''}

User question: ${userMessage}

Please provide a clear, well-formatted response using markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: systemPrompt,
      });

      return {
        text: response.text,
        action: action
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  // Enhanced fuzzy string matching for location names
  fuzzyMatch(str1, str2, threshold = 0.6) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // Exact match
    if (s1 === s2) return 1;
    
    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    // Levenshtein distance for fuzzy matching
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    const similarity = (longer.length - editDistance) / longer.length;
    
    return similarity >= threshold ? similarity : 0;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async detectIntent(userMessage, context) {
    const message = userMessage.toLowerCase().trim();
    
    // PRIORITY 1: Compare intent detection - CHECK THIS FIRST
    const comparePatterns = [
      'compare', 'comparison', 'तुलना', 'vs', 'versus', 'against',
      'difference', 'which is better', 'better than', 'contrast',
      'compare to', 'compare with', 'और', 'and'
    ];
    
    const hasCompareIntent = comparePatterns.some(pattern => message.includes(pattern));
    
    // If user explicitly wants to compare, prioritize comparison over navigation
    if (hasCompareIntent) {
      try {
        const states = await dataService.getStates();
        
        // STEP 1: Find ALL districts from ALL states first
        console.log('🔍 Searching for districts in message:', message);
        
        const allDistrictsMap = new Map(); // districtCode -> {district, state}
        
        // Fetch all districts from all states
        for (const state of states) {
          try {
            const districts = await dataService.getDistrictsByState(state.stateName);
            for (const district of districts) {
              allDistrictsMap.set(district.districtCode, {
                ...district,
                stateName: state.stateName
              });
            }
          } catch (error) {
            continue;
          }
        }
        
        console.log(`📍 Total districts loaded: ${allDistrictsMap.size}`);
        
        // STEP 2: Find EXACT matches first (highest priority)
        const exactMatches = [];
        
        for (const [code, districtInfo] of allDistrictsMap) {
          const districtNameLower = districtInfo.districtName.toLowerCase();
          
          // Check if the EXACT district name appears as a word in the message
          // Use word boundaries to avoid partial matches
          const regex = new RegExp(`\\b${districtNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          
          if (regex.test(message)) {
            exactMatches.push(districtInfo);
            console.log(`✓ EXACT match found: ${districtInfo.districtName}`);
          }
        }
        
        // If we found EXACTLY what user typed, use only those
        if (exactMatches.length >= 2) {
          console.log(`✅ Returning ${exactMatches.length} exact matches`);
          return {
            type: 'navigate',
            target: 'compare',
            compareType: 'districts',
            districts: exactMatches,
            confidence: 1.0
          };
        }
        
        if (exactMatches.length === 1) {
          console.log(`✅ Returning 1 exact match for pre-selection`);
          return {
            type: 'navigate',
            target: 'compare',
            compareType: 'districts',
            district: exactMatches[0],
            confidence: 1.0
          };
        }
        
        // STEP 3: Only if NO exact matches, try fuzzy matching (with very high threshold)
        console.log('⚠️ No exact matches, trying fuzzy matching...');
        
        const fuzzyMatches = [];
        const words = message.split(/\s+/).filter(w => w.length >= 4);
        
        for (const [code, districtInfo] of allDistrictsMap) {
          const districtNameLower = districtInfo.districtName.toLowerCase();
          
          for (const word of words) {
            // Only accept VERY close fuzzy matches (95%+ similarity)
            const similarity = this.fuzzyMatch(word, districtNameLower, 0.95);
            
            if (similarity >= 0.95) {
              fuzzyMatches.push({ district: districtInfo, similarity });
              console.log(`~ Fuzzy match: ${districtInfo.districtName} (${(similarity * 100).toFixed(1)}%)`);
              break;
            }
          }
        }
        
        // Sort by similarity and take top matches
        fuzzyMatches.sort((a, b) => b.similarity - a.similarity);
        const topFuzzyMatches = fuzzyMatches.slice(0, 3).map(m => m.district);
        
        if (topFuzzyMatches.length >= 2) {
          console.log(`⚠️ Returning ${topFuzzyMatches.length} fuzzy matches`);
          return {
            type: 'navigate',
            target: 'compare',
            compareType: 'districts',
            districts: topFuzzyMatches,
            confidence: 0.85
          };
        }
        
        if (topFuzzyMatches.length === 1) {
          return {
            type: 'navigate',
            target: 'compare',
            compareType: 'districts',
            district: topFuzzyMatches[0],
            confidence: 0.85
          };
        }
        
        // FALLBACK: Try state comparison if no district matches
        console.log('⚠️ No district matches, checking states...');
        
        const exactStateMatches = [];
        
        for (const state of states) {
          const stateNameLower = state.stateName.toLowerCase();
          const regex = new RegExp(`\\b${stateNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          
          if (regex.test(message)) {
            exactStateMatches.push(state);
            console.log(`✓ EXACT state match: ${state.stateName}`);
          }
        }
        
        if (exactStateMatches.length >= 2) {
          console.log(`✅ Returning ${exactStateMatches.length} state matches`);
          return {
            type: 'navigate',
            target: 'compare',
            compareType: 'states',
            states: exactStateMatches,
            confidence: 1.0
          };
        }
        
        if (exactStateMatches.length === 1) {
          return {
            type: 'navigate',
            target: 'compare',
            compareType: 'states',
            state: exactStateMatches[0],
            confidence: 1.0
          };
        }
        
        // If compare keyword but no specific locations, go to compare page
        if (message.match(/\b(compare page|comparison tool|compare districts|compare states)\b/i)) {
          return {
            type: 'navigate',
            target: 'compare',
            confidence: 0.95
          };
        }
        
        console.log('❌ No matches found');
        
      } catch (error) {
        console.error('Comparison detection error:', error);
      }
    }
    
    // PRIORITY 2: Navigation patterns (only if not a comparison request)
    const navigationTriggers = [
      // English variations
      'show', 'display', 'view', 'open', 'see', 'check', 'look at', 'find',
      'go to', 'take me to', 'navigate to', 'visit', 'explore', 'access',
      'want to see', 'wanna see', 'i want', 'can i see', 'show me', 'let me see',
      'tell me about', 'what about', 'info on', 'information on', 'details',
      'data for', 'data of', 'stats for', 'statistics for', 'performance',
      'how is', 'what is', 'where is', 'find me', 'search for', 'lookup',
      // Hindi variations
      'दिखाओ', 'देखो', 'खोलो', 'दिखाना', 'देखना', 'चेक करो', 'खोजो',
      'ले जाओ', 'जाना है', 'देखना चाहता', 'जानकारी', 'डेटा', 'खोज'
    ];
    
    const hasNavigationIntent = navigationTriggers.some(pattern => message.includes(pattern));
    
    // SMART LOCATION EXTRACTION - Enhanced with better typo handling
    try {
      const states = await dataService.getStates();
      
      // Strategy 1: Direct fuzzy matching with all states (with typo tolerance)
      let bestStateMatch = null;
      let bestStateScore = 0;
      
      for (const state of states) {
        const score = this.fuzzyMatch(message, state.stateName, 0.5); // Lowered threshold
        if (score > bestStateScore && score > 0.5) {
          bestStateScore = score;
          bestStateMatch = state;
        }
      }
      
      // Strategy 2: Word-by-word matching with typo tolerance
      if (!bestStateMatch || bestStateScore < 0.7) {
        const words = message.split(/\s+/);
        for (const word of words) {
          if (word.length < 3) continue;
          
          for (const state of states) {
            const score = this.fuzzyMatch(word, state.stateName, 0.5); // Typo-tolerant
            if (score > bestStateScore && score > 0.5) {
              bestStateScore = score;
              bestStateMatch = state;
            }
          }
        }
      }
      
      if (bestStateMatch) {
        // Get districts for this state
        const districts = await dataService.getDistrictsByState(bestStateMatch.stateName);
        
        // Strategy 1: Direct district fuzzy matching with typo tolerance
        let bestDistrictMatch = null;
        let bestDistrictScore = 0;
        
        for (const district of districts) {
          const score = this.fuzzyMatch(message, district.districtName, 0.5);
          if (score > bestDistrictScore && score > 0.5) {
            bestDistrictScore = score;
            bestDistrictMatch = district;
          }
        }
        
        // Strategy 2: Word-by-word district matching
        if (!bestDistrictMatch || bestDistrictScore < 0.7) {
          const words = message.split(/\s+/);
          for (const word of words) {
            if (word.length < 3) continue;
            
            for (const district of districts) {
              const score = this.fuzzyMatch(word, district.districtName, 0.5);
              if (score > bestDistrictScore && score > 0.5) {
                bestDistrictScore = score;
                bestDistrictMatch = district;
              }
            }
          }
        }
        
        // SMART DECISION MAKING
        
        // If district is clearly mentioned (high score OR explicit trigger), go to district
        if (bestDistrictMatch && (bestDistrictScore > 0.7 || hasNavigationIntent)) {
          return {
            type: 'navigate',
            target: 'district',
            district: bestDistrictMatch,
            state: bestStateMatch,
            confidence: bestDistrictScore
          };
        }
        
        // If only state mentioned with navigation trigger, go to state selection
        if (hasNavigationIntent && bestStateScore > 0.6) {
          return {
            type: 'navigate',
            target: 'state',
            state: bestStateMatch,
            confidence: bestStateScore
          };
        }
        
        // If state mentioned without explicit trigger but high confidence, still navigate
        if (bestStateScore > 0.85) {
          return {
            type: 'navigate',
            target: 'state',
            state: bestStateMatch,
            confidence: bestStateScore
          };
        }
      }
    } catch (error) {
      console.error('Location matching error:', error);
    }
    
    // SMART PAGE NAVIGATION (unchanged)
    
    // Dashboard - if user asks about dashboard or current district
    if (message.match(/\b(dashboard|my dashboard|डैशबोर्ड)\b/) ||
        (context.district && message.match(/\b(current|this|my|मेरा)\b/))) {
      return {
        type: 'navigate',
        target: 'dashboard',
        confidence: 0.9
      };
    }
    
    // Home page
    if (message.match(/\b(home|home page|main page|start|beginning|मुख्य|घर)\b/)) {
      return {
        type: 'navigate',
        target: 'home',
        confidence: 0.9
      };
    }
    
    // About page
    if (message.match(/\b(about|information|help|guide|what is this|के बारे|मदद|जानकारी)\b/) && 
        (message.match(/\b(mgnrega|मनरेगा|scheme|योजना|tracker|ट्रैकर|app|एप|website|site)\b/) ||
         message.match(/\b(this|it|यह)\b/))) {
      return {
        type: 'navigate',
        target: 'about',
        confidence: 0.9
      };
    }
    
    // SMART CONTEXTUAL ACTIONS
    
    // If user mentions "my district" and we have context
    if (context.district && message.match(/\b(my district|मेरा जिला|current district)\b/)) {
      return {
        type: 'navigate',
        target: 'dashboard',
        confidence: 0.95
      };
    }
    
    return null;
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
