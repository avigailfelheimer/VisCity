import '../styles/pages/home.css';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero">
        <span className="hero-deco hero-deco-1">🌍</span>
        <span className="hero-deco hero-deco-2">✈️</span>
        <span className="hero-deco hero-deco-3">📸</span>

        <div className="hero-badge">🗺️ פלטפורמת הטיולים שלך</div>

        <h1>
          ברוכים הבאים ל-<span className="brand">VisiCity</span>
        </h1>
        <p className="lead">
          גלו מקומות חדשים, שתפו חוויות, צרו מסלולים מותאמים אישית
          ובנו את ספר הטיולים שלכם — הכל במקום אחד.
        </p>
        <div className="hero-cta-row">
          <Link to="/places" className="btn-hero-primary">🔍 גלה יעדים</Link>
          <Link to="/gallery" className="btn-hero-secondary">📷 גלריה</Link>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">100+</div>
          <div className="stat-label">יעדים מומלצים</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">500+</div>
          <div className="stat-label">תמונות בגלריה</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">∞</div>
          <div className="stat-label">מסלולים אפשריים</div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features-section">
        <h2 className="section-heading">מה תוכלו לעשות כאן?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🏖️</span>
            <h3 className="feature-title">גלו יעדים</h3>
            <p className="feature-desc">
              חפשו מקומות מומלצים, קראו ביקורות וקבלו המלצות מהקהילה.
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📸</span>
            <h3 className="feature-title">שתפו תמונות</h3>
            <p className="feature-desc">
              העלו תמונות ממסעותיכם וצרו גלריות מרהיבות לכל מקום.
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🗂️</span>
            <h3 className="feature-title">בנו מסלולים</h3>
            <p className="feature-desc">
              אספו יעדים לתיקיות מסלול אישיות ותכננו את הטיול הבא.
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3 className="feature-title">דרגו ובקרו</h3>
            <p className="feature-desc">
              השאירו ביקורות, דרגו מקומות ועזרו לקהילה לגלות אוצרות חבויים.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="quick-actions">
        <h2 className="section-heading">קישורים מהירים</h2>
        <div className="actions-row">
          <Link to="/places" className="action-card">✈️ רשימת יעדים</Link>
          <Link to="/gallery" className="action-card secondary">🖼️ גלריית תמונות</Link>
        </div>
      </section>

    </div>
  );
}