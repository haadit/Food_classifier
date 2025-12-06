import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { RECIPES } from "../data/recipes";
import { Clock, ArrowLeft, Clock3, ChefHat, Utensils, Star } from "lucide-react";
import "../App.css";
import "./RecipesPage.css";

const FALLBACK_HERO = {
  apples: "https://images.unsplash.com/photo-1633212752319-04d50974a8c4?q=80&w=1800&auto=format&fit=crop",
  banana: "https://images.unsplash.com/photo-1603833791192-4b3e5b4a1c4b?q=80&w=1800&auto=format&fit=crop",
  cucumber: "https://images.unsplash.com/photo-1604977043715-08a51c4a5a2a?q=80&w=1800&auto=format&fit=crop",
  tomato: "https://images.unsplash.com/photo-1592841209386-6b5ad622f2a2?q=80&w=1800&auto=format&fit=crop",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1800&auto=format&fit=crop",
  oranges: "https://images.unsplash.com/photo-1557800636-894a0c97b476?q=80&w=1800&auto=format&fit=crop",
  okra: "https://images.unsplash.com/photo-1633212752319-04d50974a8c4?q=80&w=1800&auto=format&fit=crop",
  capsicum: "https://images.unsplash.com/photo-1603048719536-2d2bdb5bc0c7?q=80&w=1800&auto=format&fit=crop",
  "bitter-gourd": "https://images.unsplash.com/photo-1600357169229-6f47b8f9a7d8?q=80&w=1800&auto=format&fit=crop",
};

const getFallbackItemImage = (name) =>
  `https://source.unsplash.com/1200x800/?${encodeURIComponent(name + ' recipe')}`;

const DifficultyBadge = ({ level }) => {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${difficultyColors[level] || 'bg-gray-100 text-gray-800'}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

const RecipeCard = ({ recipe, index }) => (
  <div className="recipe-card group">
    <div className="recipe-image-container">
      <img
        src={recipe.image || getFallbackItemImage(recipe.name)}
        alt={recipe.name}
        className="recipe-image"
        loading={index > 1 ? 'lazy' : 'eager'}
      />
      {recipe.prepTime && (
        <div className="prep-time">
          <Clock3 size={14} className="mr-1" />
          {recipe.prepTime}
        </div>
      )}
      {recipe.difficulty && (
        <div className="difficulty">
          <ChefHat size={14} className="mr-1" />
          <DifficultyBadge level={recipe.difficulty} />
        </div>
      )}
    </div>
    <div className="p-6">
      <h3 className="recipe-name">{recipe.name}</h3>
      {recipe.description && (
        <p className="recipe-description">{recipe.description}</p>
      )}
      <div className="recipe-meta">
        <div className="flex items-center">
          <Utensils size={16} className="mr-1 text-gray-500" />
          <span className="text-sm text-gray-600">{recipe.servings || '2-4'} servings</span>
        </div>
        {recipe.rating && (
          <div className="flex items-center">
            <Star size={16} className="mr-1 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{recipe.rating}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h4 className="steps-title">
          <ChefHat size={18} className="inline-block mr-2" />
          Step-by-Step Guide
        </h4>
        <ol className="steps">
          {recipe.steps.map((step, i) => (
            <li key={i} className="step-item">
              <span className="step-number">{i + 1}</span>
              <span className="step-text">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

export default function RecipesPage() {
  const { slug } = useParams();
  const entry = useMemo(
    () => Object.values(RECIPES).find((r) => r.slug === slug),
    [slug]
  );
  if (!entry) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">Recipes</h1>
            <Link to="/" className="back-button">
              Home
            </Link>
          </div>
        </header>
        <main
          className="app-main"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <p>No recipes for this item.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={entry.hero || FALLBACK_HERO[entry.slug]}
          alt={entry.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="container relative z-10 flex flex-col h-full px-6 mx-auto">
          <div className="flex items-center justify-between pt-6">
            <Link 
              to="/" 
              className="flex items-center text-white transition-colors hover:text-yellow-300"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 pb-16 text-center">
            <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl font-display">
              {entry.title} Recipes
            </h1>
            <p className="max-w-2xl text-lg text-gray-200 md:text-xl">
              Discover delicious {entry.title.toLowerCase()} recipes for every occasion
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container px-6 py-12 mx-auto">
        {/* Recipe Grid */}
        <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3">
          {entry.items.map((item, idx) => (
            <RecipeCard key={idx} recipe={item} index={idx} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl p-8 mx-auto mt-16 text-center bg-white rounded-2xl shadow-lg">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Want more recipes?</h2>
          <p className="mb-6 text-gray-600">
            Subscribe to our newsletter and get fresh recipes delivered to your inbox every week!
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="px-6 py-3 font-medium text-white bg-yellow-500 rounded-r-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2">
              Subscribe
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-gray-900">
        <div className="container px-6 mx-auto">
          <div className="text-center text-gray-400">
            <p>© {new Date().getFullYear()} Fresh Food Classifier. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
