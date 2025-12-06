import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { 
  Plus, 
  X, 
  Clock, 
  Utensils, 
  Save,
  Loader2,
  Calendar,
  Heart
} from 'lucide-react';
import './AddFoodTracking.css';

const AddFoodTracking = ({ isOpen, onClose, prediction = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    prediction_id: prediction?.id || null,
    food_name: prediction?.predicted_class || '',
    food_category: prediction?.predicted_class || '',
    freshness_score: prediction?.confidence || 0,
    portion_size: 'medium',
    meal_type: 'snack',
    consumed_at: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    notes: '',
    mood: 'good',
    energy_level: 5
  });

  const portionSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  const moods = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'okay', label: 'Okay' },
    { value: 'poor', label: 'Poor' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to track food');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let foodTrackingId;

      if (formData.prediction_id) {
        // Use the database function to create tracking from prediction
        const { data, error } = await supabase.rpc('create_food_tracking_from_prediction', {
          p_prediction_id: formData.prediction_id,
          p_user_id: user.id,
          p_meal_type: formData.meal_type,
          p_portion_size: formData.portion_size,
          p_notes: formData.notes || null
        });

        if (error) throw error;
        foodTrackingId = data;

        // Update with additional fields
        await supabase
          .from('food_tracking')
          .update({
            consumed_at: formData.consumed_at,
            mood: formData.mood,
            energy_level: formData.energy_level
          })
          .eq('id', foodTrackingId);
      } else {
        // Manual entry without prediction
        const { data, error } = await supabase
          .from('food_tracking')
          .insert([{
            user_id: user.id,
            food_name: formData.food_name,
            food_category: formData.food_category,
            freshness_score: formData.freshness_score,
            portion_size: formData.portion_size,
            meal_type: formData.meal_type,
            consumed_at: formData.consumed_at,
            notes: formData.notes,
            mood: formData.mood,
            energy_level: formData.energy_level,
            // Default nutritional values for manual entries
            calories: 50,
            protein: 1,
            carbs: 12,
            fat: 0.2,
            fiber: 2
          }])
          .select()
          .single();

        if (error) throw error;
        foodTrackingId = data.id;
      }

      setSuccess('Food tracking added successfully!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      prediction_id: prediction?.id || null,
      food_name: prediction?.predicted_class || '',
      food_category: prediction?.predicted_class || '',
      freshness_score: prediction?.confidence || 0,
      portion_size: 'medium',
      meal_type: 'snack',
      consumed_at: new Date().toISOString().slice(0, 16),
      notes: '',
      mood: 'good',
      energy_level: 5
    });
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="add-tracking-overlay">
      <div className="add-tracking-content">
        <div className="add-tracking-header">
          <h2 className="add-tracking-title">
            <Utensils size={24} />
            Track Food Consumption
          </h2>
          <button className="add-tracking-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-tracking-form">
          <div className="form-section">
            <h3 className="section-title">Food Information</h3>
            
            <div className="form-group">
              <label className="form-label">Food Name *</label>
              <input
                type="text"
                value={formData.food_name}
                onChange={(e) => handleInputChange('food_name', e.target.value)}
                className="form-input"
                placeholder="Enter food name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Food Category</label>
                <input
                  type="text"
                  value={formData.food_category}
                  onChange={(e) => handleInputChange('food_category', e.target.value)}
                  className="form-input"
                  placeholder="e.g., apples, banana"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Freshness Score</label>
                <input
                  type="number"
                  value={formData.freshness_score}
                  onChange={(e) => handleInputChange('freshness_score', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Portion Size</label>
                <select
                  value={formData.portion_size}
                  onChange={(e) => handleInputChange('portion_size', e.target.value)}
                  className="form-select"
                >
                  {portionSizes.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Meal Type</label>
                <select
                  value={formData.meal_type}
                  onChange={(e) => handleInputChange('meal_type', e.target.value)}
                  className="form-select"
                >
                  {mealTypes.map(meal => (
                    <option key={meal.value} value={meal.value}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Consumption Details</h3>
            
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                When did you consume this?
              </label>
              <input
                type="datetime-local"
                value={formData.consumed_at}
                onChange={(e) => handleInputChange('consumed_at', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="form-textarea"
                placeholder="Any additional notes about this food..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">How are you feeling?</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Heart size={16} />
                  Mood
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => handleInputChange('mood', e.target.value)}
                  className="form-select"
                >
                  {moods.map(mood => (
                    <option key={mood.value} value={mood.value}>
                      {mood.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Energy Level (1-10)</label>
                <input
                  type="range"
                  value={formData.energy_level}
                  onChange={(e) => handleInputChange('energy_level', parseInt(e.target.value))}
                  className="form-range"
                  min="1"
                  max="10"
                />
                <div className="range-value">{formData.energy_level}</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                onClose();
                resetForm();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Track Food
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodTracking;
