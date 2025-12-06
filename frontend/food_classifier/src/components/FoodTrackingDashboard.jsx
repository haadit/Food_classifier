import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Heart, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChefHat
} from 'lucide-react';
import './FoodTrackingDashboard.css';

const FoodTrackingDashboard = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [data, setData] = useState({
    foodTracking: [],
    predictions: [],
    userRecipes: [],
    analytics: {
      totalFoods: 0,
      avgFreshness: 0,
      caloriesConsumed: 0,
      healthScore: 0,
      wasteReduction: 0,
      recipesCreated: 0,
    }
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchDashboardData();
    }
  }, [isOpen, user, timeRange]);

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('No user found, skipping dashboard data fetch');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching dashboard data for user:', user.id);
      const dateRange = getDateRange(timeRange);
      console.log('Date range:', dateRange);
      
      // Fetch food tracking data
      const { data: foodTracking, error: trackingError } = await supabase
        .from('food_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('consumed_at', dateRange.start)
        .lte('consumed_at', dateRange.end)
        .order('consumed_at', { ascending: false });

      if (trackingError) {
        console.error('Error fetching food tracking:', trackingError);
        throw trackingError;
      }
      console.log('Food tracking data:', foodTracking);

      // Fetch predictions data
      const { data: predictions, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false });

      if (predictionsError) {
        console.error('Error fetching predictions:', predictionsError);
        throw predictionsError;
      }
      console.log('Predictions data:', predictions);

      // Fetch user recipes
      const { data: userRecipes, error: recipesError } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false });

      if (recipesError) {
        console.error('Error fetching user recipes:', recipesError);
        throw recipesError;
      }
      console.log('User recipes data:', userRecipes);

      // Calculate analytics
      const analytics = calculateAnalytics(foodTracking || [], predictions || [], userRecipes || []);
      console.log('Calculated analytics:', analytics);
      
      setData({
        foodTracking: foodTracking || [],
        predictions: predictions || [],
        userRecipes: userRecipes || [],
        analytics
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range) => {
    const now = new Date();
    switch (range) {
      case 'week':
        return {
          start: startOfWeek(now).toISOString(),
          end: endOfWeek(now).toISOString()
        };
      case 'month':
        return {
          start: startOfMonth(now).toISOString(),
          end: endOfMonth(now).toISOString()
        };
      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1).toISOString(),
          end: new Date(now.getFullYear(), 11, 31).toISOString()
        };
      default:
        return {
          start: subDays(now, 7).toISOString(),
          end: now.toISOString()
        };
    }
  };

  const calculateAnalytics = (foodTracking, predictions, userRecipes) => {
    const totalFoods = foodTracking.length;
    const avgFreshness = totalFoods > 0 
      ? foodTracking.reduce((sum, item) => sum + item.freshness_score, 0) / totalFoods
      : 0;
    
    const caloriesConsumed = foodTracking.reduce((sum, item) => sum + (item.calories || 0), 0);
    
    // Calculate health score based on freshness and variety
    const healthScore = totalFoods > 0 
      ? Math.round((avgFreshness * 0.7 + (totalFoods / 10) * 0.3) * 100)
      : 0;
    
    // Calculate waste reduction (foods with high freshness score)
    const wasteReduction = totalFoods > 0
      ? Math.round((foodTracking.filter(item => item.freshness_score > 0.8).length / totalFoods) * 100)
      : 0;

    const recipesCreated = userRecipes.length;

    return {
      totalFoods,
      avgFreshness: Math.round(avgFreshness * 100),
      caloriesConsumed: Math.round(caloriesConsumed),
      healthScore: Math.min(healthScore, 100),
      wasteReduction,
      recipesCreated
    };
  };

  const getChartData = () => {
    const groupedData = {};
    
    data.foodTracking.forEach(item => {
      const date = format(new Date(item.consumed_at), 'MMM dd');
      if (!groupedData[date]) {
        groupedData[date] = { date, foods: 0, calories: 0, freshness: 0, count: 0 };
      }
      groupedData[date].foods += 1;
      groupedData[date].calories += item.calories || 0;
      groupedData[date].freshness += item.freshness_score;
      groupedData[date].count += 1;
    });

    return Object.values(groupedData).map(item => ({
      ...item,
      avgFreshness: item.count > 0 ? Math.round((item.freshness / item.count) * 100) : 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getFoodCategoryData = () => {
    const categories = {};
    data.foodTracking.forEach(item => {
      categories[item.food_category] = (categories[item.food_category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name: name.replace('fresh', '').replace('rotten', ''),
      value,
      status: name.startsWith('fresh') ? 'Fresh' : 'Rotten'
    }));
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  if (!isOpen) return null;

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal-content">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Food Tracking Dashboard</h2>
          <div className="dashboard-controls">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="refresh-btn"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <Loader2 size={32} className="animate-spin" />
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Analytics Cards */}
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="card-icon">
                  <Target size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-title">Total Foods</h3>
                  <p className="card-value">{data.analytics.totalFoods}</p>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-title">Avg Freshness</h3>
                  <p className="card-value">{data.analytics.avgFreshness}%</p>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-icon">
                  <Heart size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-title">Health Score</h3>
                  <p className="card-value">{data.analytics.healthScore}/100</p>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-icon">
                  <AlertTriangle size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-title">Waste Reduction</h3>
                  <p className="card-value">{data.analytics.wasteReduction}%</p>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-icon">
                  <ChefHat size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-title">Recipes Created</h3>
                  <p className="card-value">{data.analytics.recipesCreated}</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-container">
                <h3 className="chart-title">Food Consumption Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="foods" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3 className="chart-title">Food Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getFoodCategoryData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getFoodCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3 className="chart-title">Freshness Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgFreshness" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3 className="chart-title">Calorie Intake</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calories" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodTrackingDashboard;
