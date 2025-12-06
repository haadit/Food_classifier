import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadHistory, clearHistory } from "../services/history";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";
import "../components/HistoryModal.css";
import "./HistoryPage.css";

export default function HistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        console.log('HistoryPage: Starting to load history (all predictions)');
        
        setIsLoading(true);
        setError(null);
        const history = await loadHistory(); // Don't pass userId
        console.log('HistoryPage: Loaded history:', history);
        setItems(history);
      } catch (err) {
        console.error('HistoryPage: Error loading history:', err);
        setError("Failed to load history");
      } finally {
        console.log('HistoryPage: Setting loading to false');
        setIsLoading(false);
      }
    };

    console.log('HistoryPage: useEffect triggered');
    loadHistoryData();
  }, []); // Remove user dependency

  const handleClearHistory = async () => {
    try {
      await clearHistory(user?.id);
      setItems([]);
    } catch (err) {
      setError("Failed to clear history");
      console.error("Error clearing history:", err);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="history-nav">
            <h1 className="app-title">Analysis History</h1>
            <div className="history-controls">
              <Link to="/" className="back-button">
                Back
              </Link>
              {items.length > 0 && (
                <button
                  className="clear-btn"
                  onClick={handleClearHistory}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="history-container">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading history...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-text">{error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="history-empty-text">No analyses yet.</p>
          ) : (
            <div className="history-grid">
              {items.map((it, i) => (
                <div key={it.id || i} className="history-card pretty">
                  <div className="thumb-wrap">
                    <img src={it.thumbnail} alt={it.label} />
                  </div>
                  <div className="meta">
                    <div
                      className={`badge ${
                        it.label?.startsWith("fresh") ? "fresh" : "rotten"
                      }`}
                    >
                      {it.label}
                    </div>
                    <div className="conf">
                      {Math.round(it.confidence * 100)}%
                    </div>
                  </div>
                  <div className="row" style={{ paddingBottom: "0.75rem" }}>
                    <span className="time">
                      {new Date(it.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
