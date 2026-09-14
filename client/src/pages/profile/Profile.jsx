import { useContext, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useUserPlaces } from '../../hooks/useUserPlaces';
import { useUserReviews } from '../../hooks/useUserReviews';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import { PROFILE_TABS } from '../../constants/profileTabs';
import UserPlacesList from '../../components/profile/UserPlacesList';
import UserReviewsList from '../../components/profile/UserReviewsList';
import '../../styles/pages/profile.css';

export default function Profile() {
  const { user } = useContext(UserContext);
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user);
  const { places, loading: placesLoading, error: placesError } = useUserPlaces(user?.id, user?.token);
  const { reviews, loading: reviewsLoading, error: reviewsError } = useUserReviews(user?.id, user?.token);
  const [activeTab, setActiveTab] = useState(PROFILE_TABS.PLACES);

  if (!user) return <div className="profile-message">אנא היכנסו למערכת.</div>;

  return (
    <div className="profile-page">
      <ProfileHeader profile={profile} loading={profileLoading} error={profileError} />

      <ProfileTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        placesCount={places.length}
        reviewsCount={reviews.length}
      />

      <div className="profile-tab-content">
        {activeTab === PROFILE_TABS.PLACES ? (
          <UserPlacesList places={places} loading={placesLoading} error={placesError} />
        ) : (
          <UserReviewsList reviews={reviews} loading={reviewsLoading} error={reviewsError} />
        )}
      </div>
    </div>
  );
}
