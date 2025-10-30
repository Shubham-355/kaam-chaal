import axios from 'axios';

const BASE_URL = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
const API_KEY = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

class ApiService {
  async fetchDistricts(state, finYear, offset = 0, limit = 100) {
    try {
      const params = {
        'api-key': API_KEY,
        format: 'json',
        offset,
        limit,
      };

      // Only add state filter if state is specified
      if (state) {
        params['filters[state_name]'] = state;
      }

      if (finYear) {
        params['filters[fin_year]'] = finYear;
      }

      const response = await axios.get(BASE_URL, { 
        params,
        timeout: 30000 
      });

      return response.data;
    } catch (error) {
      // Only log error message, not full error object
      throw new Error(`API error: ${error.message}`);
    }
  }

  async fetchAllPages(state, finYear) {
    const allRecords = [];
    let offset = 0;
    const limit = 500;
    let hasMore = true;

    while (hasMore) {
      const data = await this.fetchDistricts(state, finYear, offset, limit);
      
      if (data.records && data.records.length > 0) {
        allRecords.push(...data.records);
        offset += limit;
        
        // Check if we've fetched all records
        if (allRecords.length >= data.total || data.records.length < limit) {
          hasMore = false;
        }

        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        hasMore = false;
      }
    }

    return allRecords;
  }
}

export default new ApiService();
