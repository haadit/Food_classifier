import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { 
  Plus, 
  X, 
  Clock, 
  Users, 
  ChefHat, 
  Image as ImageIcon,
  Save,
  Loader2,
  Star
} from 'lucide-react';
import './AddRecipe.css';

const AddRecipe = ({ isOpen, onClose, foodCategory = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    food_category: foodCategory || '',
    difficulty_level: 'easy',
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    ingredients: [''],
    instructions: [''],
    tags: [],
    image_url: '',
    is_public: false
  });

  const foodCategories = [
    'apples', 'banana', 'bittergourd', 'capsicum', 'cucumber',
    'okra', 'oranges', 'potato', 'tomato'
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to add recipes');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Clean up empty ingredients and instructions
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
        instructions: formData.instructions.filter(inst => inst.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== '')
      };

      const { data, error } = await supabase
        .from('user_recipes')
        .insert([{
          user_id: user.id,
          ...cleanedData
        }])
        .select()
        .single();

      if (error) throw error;

      setSuccess('Recipe added successfully!');
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
      title: '',
      description: '',
      food_category: foodCategory || '',
      difficulty_level: 'easy',
      prep_time: 0,
      cook_time: 0,
      servings: 1,
      ingredients: [''],
      instructions: [''],
      tags: [],
      image_url: '',
      is_public: false
    });
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="add-recipe-overlay">
      <div className="add-recipe-content">
        <div className="add-recipe-header">
          <h2 className="add-recipe-title">
            <ChefHat size={24} />
            Add Your Recipe
          </h2>
          <button className="add-recipe-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-recipe-form">
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            <div className="form-group">
              <label className="form-label">Recipe Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="form-input"
                placeholder="Enter recipe title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-textarea"
                placeholder="Describe your recipe..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Food Category *</label>
                <select
                  value={formData.food_category}
                  onChange={(e) => handleInputChange('food_category', e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select category</option>
                  {foodCategories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                  className="form-select"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.prep_time}
                  onChange={(e) => handleInputChange('prep_time', parseInt(e.target.value) || 0)}
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.cook_time}
                  onChange={(e) => handleInputChange('cook_time', parseInt(e.target.value) || 0)}
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  Servings
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                  className="form-input"
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Ingredients</h3>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                  className="form-input"
                  placeholder={`Ingredient ${index + 1}`}
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeArrayItem('ingredients', index)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-item-btn"
              onClick={() => addArrayItem('ingredients')}
            >
              <Plus size={16} />
              Add Ingredient
            </button>
          </div>

          <div className="form-section">
            <h3 className="section-title">Instructions</h3>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="array-item">
                <textarea
                  value={instruction}
                  onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                  className="form-textarea"
                  placeholder={`Step ${index + 1}`}
                  rows={2}
                />
                {formData.instructions.length > 1 && (
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeArrayItem('instructions', index)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-item-btn"
              onClick={() => addArrayItem('instructions')}
            >
              <Plus size={16} />
              Add Step
            </button>
          </div>

          <div className="form-section">
            <h3 className="section-title">Additional Details</h3>
            
            <div className="form-group">
              <label className="form-label">
                <ImageIcon size={16} />
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tags-container">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleTagRemove(tag)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input"
                  placeholder="Add tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => handleInputChange('is_public', e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Make this recipe public</span>
              </label>
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
                  Save Recipe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;
