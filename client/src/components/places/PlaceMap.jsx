import { useEffect, useRef } from 'react';

export default function PlaceMap({ lat, lng }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;
    if (!window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: Number(lat), lng: Number(lng) },
      zoom: 14,
    });

    new window.google.maps.Marker({
      position: { lat: Number(lat), lng: Number(lng) },
      map,
    });
  }, [lat, lng]);

  if (!lat || !lng) {
    return <div className="map-box">אין מיקום למקום הזה 🗺️</div>;
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '12px',
        marginTop: '16px',
      }}
    />
  );
}