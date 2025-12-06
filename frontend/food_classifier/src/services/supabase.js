import { createClient } from '@supabase/supabase-js';

// Test function to check authentication
export async function testAuthentication() {
  try {
    console.log('testAuthentication: Checking current session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('testAuthentication: Session:', session);
    console.log('testAuthentication: Error:', error);
    
    if (session?.user) {
      console.log('testAuthentication: User ID:', session.user.id);
      console.log('testAuthentication: User email:', session.user.email);
      
      // Test a simple query
      const { data, error: queryError } = await supabase
        .from('predictions')
        .select('id, predicted_class')
        .eq('user_id', session.user.id)
        .limit(1);
      
      console.log('testAuthentication: Query result:', data);
      console.log('testAuthentication: Query error:', queryError);
    }
    
    return { session, error };
  } catch (error) {
    console.error('testAuthentication: Error:', error);
    return { session: null, error };
  }
}

const supabaseUrl = 'https://fhdcostlqegpqxoyyrik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZGNvc3RscWVncHF4b3l5cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODgyNDQsImV4cCI6MjA3NzA2NDI0NH0.owHbmbqJr_pRMIv9GSs5JqYA6KiTKBfRS1qfRodE8gM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Upload image to Supabase Storage and get public URL
export async function uploadImageToStorage(file, fileName) {
  try {
    const { data, error } = await supabase.storage
      .from('predictions')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('predictions')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Save prediction to database
export async function savePrediction(predictionData) {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .insert([predictionData])
      .select()
      .single();

    if (error) {
      console.error('Database save error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving prediction:', error);
    throw error;
  }
}

// Get predictions history
export async function getPredictionsHistory(limit = 50, userId = null) {
  try {
    console.log('getPredictionsHistory: Starting with userId:', userId, 'limit:', limit);
    let query = supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Show all predictions regardless of user authentication
    // No filtering by user_id - show everything
    
    console.log('getPredictionsHistory: Executing query for all predictions...');
    const { data, error } = await query;
    
    if (error) {
      console.error('getPredictionsHistory: Database error:', error);
      throw error;
    }
    
    console.log('getPredictionsHistory: Success, got data:', data);
    return data || [];
  } catch (error) {
    console.error('getPredictionsHistory: Error fetching predictions:', error);
    throw error;
  }
}

// Delete prediction
export async function deletePrediction(id) {
  try {
    const { error } = await supabase
      .from('predictions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting prediction:', error);
    throw error;
  }
}

// Clear all predictions
export async function clearAllPredictions(userId = null) {
  try {
    let query = supabase.from('predictions').delete();
    
    if (userId) {
      // Clear predictions for specific user
      query = query.eq('user_id', userId);
    } else {
      // Clear predictions for anonymous users (user_id is null)
      query = query.is('user_id', null);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing predictions:', error);
    throw error;
  }
}
