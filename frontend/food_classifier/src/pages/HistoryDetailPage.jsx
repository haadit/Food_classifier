import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { loadHistory } from "../services/history";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "../App.css";
import "../components/ResultsDisplay.css";
import "../components/HistoryModal.css";

export default function HistoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const list = loadHistory();
    const idx = Number(id);
    const it = isNaN(idx) ? null : list[idx];
    if (!it) {
      navigate("/history");
    } else {
      setItem(it);
    }
  }, [id, navigate]);

  const chartData = useMemo(() => {
    if (!item?.all_confidences) return [];
    return Object.entries(item.all_confidences)
      .map(([k, v]) => ({ name: k, confidence: Math.round(v * 100) }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }, [item]);

  if (!item) return null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Analysis Detail</h1>
          <div>
            <Link to="/history" className="reset-button">
              Back to History
            </Link>
            <Link
              to="/"
              className="reset-button"
              style={{ marginLeft: "0.5rem" }}
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main
        className="app-main"
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "1rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "1rem",
          }}
        >
          <div className="analyzed-image">
            <img
              src={item.thumbnail}
              alt={item.label}
              style={{ maxWidth: "100%" }}
            />
          </div>
          <div className="results-container">
            <div className="results-header">
              <h2 className="results-title">{item.label}</h2>
              <div
                className={`confidence-badge ${
                  item.label?.startsWith("fresh") ? "fresh" : "rotten"
                }`}
              >
                <span>{Math.round(item.confidence * 100)}% Confidence</span>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Confidence (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip formatter={(v) => [`${v}%`, "Confidence"]} />
                  <Bar
                    dataKey="confidence"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
