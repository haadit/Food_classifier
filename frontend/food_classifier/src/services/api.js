import axios from 'axios';

// Allow overriding API URL via environment variable at build time
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // allow up to 120s for model inference
});

export const foodClassifierAPI = {
  // Health check endpoint
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Predict food freshness
  async predictFood(imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.error || 'Prediction failed');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Unable to connect to the server. Please make sure the backend is running.');
      } else {
        // Something else happened
        throw new Error(`Prediction failed: ${error.message}`);
      }
    }
  },
};

export default foodClassifierAPI;
