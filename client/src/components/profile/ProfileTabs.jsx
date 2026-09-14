import { PROFILE_TABS } from '../../constants/profileTabs';

export default function ProfileTabs({ activeTab, onChange, placesCount, reviewsCount }) {
  return (
    <div className="profile-tabs" role="tablist">
      <button
        className={`profile-tab ${activeTab === PROFILE_TABS.PLACES ? 'profile-tab--active' : ''}`}
        onClick={() => onChange(PROFILE_TABS.PLACES)}
        role="tab"
        aria-selected={activeTab === PROFILE_TABS.PLACES}
      >
        🗺️ הטיולים שלי
        {typeof placesCount === 'number' && placesCount > 0 && (
          <span className="profile-tab__count">{placesCount}</span>
        )}
      </button>

      <button
        className={`profile-tab ${activeTab === PROFILE_TABS.REVIEWS ? 'profile-tab--active' : ''}`}
        onClick={() => onChange(PROFILE_TABS.REVIEWS)}
        role="tab"
        aria-selected={activeTab === PROFILE_TABS.REVIEWS}
      >
        💬 התגובות שלי
        {typeof reviewsCount === 'number' && reviewsCount > 0 && (
          <span className="profile-tab__count">{reviewsCount}</span>
        )}
      </button>
    </div>
  );
}
