import { 
  supabase, 
  uploadImageToStorage, 
  savePrediction, 
  getPredictionsHistory, 
  clearAllPredictions 
} from './supabase';

// Convert File to base64 for storage
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const loadHistory = async (userId = null) => {
  try {
    console.log('loadHistory: Starting (showing all predictions regardless of user)');
    const predictions = await getPredictionsHistory(50); // Don't pass userId
    console.log('loadHistory: Got predictions from database:', predictions);
    const mappedPredictions = predictions.map(pred => ({
      id: pred.id,
      label: pred.predicted_class,
      confidence: pred.confidence,
      timestamp: pred.created_at,
      thumbnail: pred.image_url,
      all_confidences: pred.all_confidences
    }));
    console.log('loadHistory: Mapped predictions:', mappedPredictions);
    return mappedPredictions;
  } catch (error) {
    console.error("loadHistory: Failed to load history from Supabase", error);
    return [];
  }
};

export const saveHistoryItem = async (item, imageFile, userId = null) => {
  try {
    let imageUrl = '';
    
    // Try to upload image to Supabase Storage
    try {
      const fileName = `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      imageUrl = await uploadImageToStorage(imageFile, fileName);
      console.log('Image uploaded successfully:', imageUrl);
    } catch (uploadError) {
      console.warn('Image upload failed, using fallback:', uploadError);
      // Fallback: convert image to base64 data URL
      const reader = new FileReader();
      imageUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    }
    
    // Prepare prediction data
    const predictionData = {
      user_id: userId, // Will be null for anonymous users
      image_url: imageUrl,
      predicted_class: item.label,
      confidence: item.confidence,
      all_confidences: item.all_confidences
    };
    
    console.log('Saving prediction data:', predictionData);
    
    // Save to database
    const savedPrediction = await savePrediction(predictionData);
    
    console.log('Prediction saved successfully:', savedPrediction);
    
    return {
      id: savedPrediction.id,
      label: savedPrediction.predicted_class,
      confidence: savedPrediction.confidence,
      timestamp: savedPrediction.created_at,
      thumbnail: savedPrediction.image_url,
      all_confidences: savedPrediction.all_confidences
    };
  } catch (error) {
    console.error("Failed to save history item to Supabase", error);
    throw error;
  }
};

export const clearHistory = async (userId = null) => {
  try {
    await clearAllPredictions(userId);
  } catch (error) {
    console.error("Failed to clear history from Supabase", error);
    throw error;
  }
};