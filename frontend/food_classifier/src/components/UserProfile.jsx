import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Target, Heart, AlertTriangle, Save, Loader2 } from 'lucide-react';
import './UserProfile.css';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    dietary_restrictions: [],
    dietary_goals: 'general_health',
    food_preferences: [],
    health_conditions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        dietary_restrictions: profile.dietary_restrictions || [],
        dietary_goals: profile.dietary_goals || 'general_health',
        food_preferences: profile.food_preferences || [],
        health_conditions: profile.health_conditions || [],
      });
    }
  }, [profile]);

  const dietaryRestrictions = [
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_allergy',
    'shellfish_allergy', 'soy_free', 'keto', 'paleo', 'halal', 'kosher'
  ];

  const dietaryGoals = [
    { value: 'general_health', label: 'General Health' },
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'diabetes_management', label: 'Diabetes Management' },
    { value: 'heart_health', label: 'Heart Health' },
    { value: 'digestive_health', label: 'Digestive Health' },
  ];

  const foodPreferences = [
    'spicy', 'mild', 'sweet', 'savory', 'bitter', 'sour',
    'crunchy', 'soft', 'hot', 'cold', 'raw', 'cooked'
  ];

  const healthConditions = [
    'diabetes', 'hypertension', 'heart_disease', 'digestive_issues',
    'food_allergies', 'autoimmune', 'pregnancy', 'lactose_intolerant'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <button className="profile-close-btn" onClick={onClose}>
          ×
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            <User size={32} />
          </div>
          <h2 className="profile-title">User Profile</h2>
          <p className="profile-subtitle">Customize your food experience</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3 className="section-title">
              <User size={16} />
              Personal Information
            </h3>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="email-display">
                <Mail size={16} />
                {user?.email}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <Target size={16} />
              Dietary Goals
            </h3>
            
            <div className="form-group">
              <label className="form-label">Primary Goal</label>
              <select
                value={formData.dietary_goals}
                onChange={(e) => handleInputChange('dietary_goals', e.target.value)}
                className="form-select"
              >
                {dietaryGoals.map(goal => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <AlertTriangle size={16} />
              Dietary Restrictions
            </h3>
            
            <div className="checkbox-group">
              {dietaryRestrictions.map(restriction => (
                <label key={restriction} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.dietary_restrictions.includes(restriction)}
                    onChange={() => handleArrayToggle('dietary_restrictions', restriction)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    {restriction.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <Heart size={16} />
              Food Preferences
            </h3>
            
            <div className="checkbox-group">
              {foodPreferences.map(preference => (
                <label key={preference} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.food_preferences.includes(preference)}
                    onChange={() => handleArrayToggle('food_preferences', preference)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    {preference.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <AlertTriangle size={16} />
              Health Conditions
            </h3>
            
            <div className="checkbox-group">
              {healthConditions.map(condition => (
                <label key={condition} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.health_conditions.includes(condition)}
                    onChange={() => handleArrayToggle('health_conditions', condition)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    {condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
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

          <button
            type="submit"
            className="profile-save-btn"
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
                Save Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
