import { useMemo } from "react";
import { X, Clock, Trash2, Image as ImgIcon } from "lucide-react";
import "./HistoryModal.css";

const formatDate = (iso) => new Date(iso).toLocaleString();

export default function HistoryModal({ open, onClose, items, onClear }) {
  const hasItems = useMemo(() => items && items.length > 0, [items]);
  if (!open) return null;

  return (
    <div className="history-overlay" role="dialog" aria-modal="true">
      <div className="history-modal">
        <div className="history-header">
          <h2 className="history-title">Analysis History</h2>
          <div className="history-actions">
            {hasItems && (
              <button className="clear-btn" onClick={onClear} title="Clear all">
                <Trash2 size={16} /> Clear
              </button>
            )}
            <button className="close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {!hasItems ? (
          <div className="history-empty">
            <ImgIcon size={40} />
            <p>No analyses yet. Upload an image to get started.</p>
          </div>
        ) : (
          <div className="history-grid">
            {items.map((it, idx) => (
              <div key={idx} className="history-card">
                <div className="thumb-wrap">
                  {it.thumbnail ? (
                    <img src={it.thumbnail} alt={it.label} />
                  ) : (
                    <div className="thumb-fallback" />
                  )}
                </div>
                <div className="meta">
                  <div
                    className={`badge ${
                      it.label?.startsWith("fresh") ? "fresh" : "rotten"
                    }`}
                  >
                    {it.label}
                  </div>
                  <div className="conf">{Math.round(it.confidence * 100)}%</div>
                </div>
                <div className="row">
                  <Clock size={14} />
                  <span className="time">{formatDate(it.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
