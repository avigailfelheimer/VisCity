import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = { lat: 31.7683, lng: 35.2137 };
const LOAD_TIMEOUT_MS = 6000;

export default function PlaceLocationPicker({ latitude, longitude, onChange }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);

  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const autocompleteRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [mapsError, setMapsError] = useState(false);

  // --- detect Google Maps load ---
  useEffect(() => {
    if (window.__GMAPS_AUTH_FAILED__) {
      setMapsError(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(interval);
        setReady(true);
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.google?.maps?.places) setMapsError(true);
    }, LOAD_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // --- init map ONLY ONCE ---
  useEffect(() => {
    if (!ready || mapsError) return;
    if (!mapRef.current || !inputRef.current) return;
    if (mapInstance.current) return; // חשוב מאוד! מונע כפילות

    const hasPos = latitude != null && longitude != null;

    const position = hasPos
      ? { lat: Number(latitude), lng: Number(longitude) }
      : DEFAULT_CENTER;

    // MAP
    const map = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: hasPos ? 14 : 7,
      gestureHandling: 'cooperative',
    });

    mapInstance.current = map;

    // MARKER
    const marker = new window.google.maps.Marker({
      position,
      map,
      draggable: true,
    });

    markerInstance.current = marker;

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      onChange({
        latitude: pos.lat(),
        longitude: pos.lng(),
        google_place_id: null,
      });
    });

    map.addListener('click', (e) => {
      marker.setPosition(e.latLng);
      onChange({
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng(),
        google_place_id: null,
      });
    });

    // AUTOCOMPLETE (בלי DOM hacks)
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      { fields: ['geometry', 'place_id', 'name'] }
    );

    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return;

      map.setCenter(loc);
      map.setZoom(15);
      marker.setPosition(loc);

      onChange({
        latitude: loc.lat(),
        longitude: loc.lng(),
        google_place_id: place.place_id || null,
      });
    });

    return () => {
      window.google?.maps?.event?.clearInstanceListeners(map);
      window.google?.maps?.event?.clearInstanceListeners(marker);
      window.google?.maps?.event?.clearInstanceListeners(autocomplete);

      marker.setMap(null);

      mapInstance.current = null;
      markerInstance.current = null;
      autocompleteRef.current = null;
    };
  }, [ready, mapsError]);

  // --- update position without recreating map ---
  useEffect(() => {
    if (!mapInstance.current || !markerInstance.current) return;
    if (latitude == null || longitude == null) return;

    const pos = {
      lat: Number(latitude),
      lng: Number(longitude),
    };

    markerInstance.current.setPosition(pos);
    mapInstance.current.setCenter(pos);
  }, [latitude, longitude]);

  const handleManualChange = (field, value) => {
    const num = value.trim() === '' ? null : Number(value);
    if (value.trim() !== '' && Number.isNaN(num)) return;

    onChange({
      latitude: field === 'latitude' ? num : latitude,
      longitude: field === 'longitude' ? num : longitude,
      google_place_id: null,
    });
  };

  return (
    <div className="form-group">
      <label className="form-label">מיקום</label>

      {mapsError ? (
        <div className="location-picker-fallback">
          ⚠️ לא ניתן לטעון Google Maps. ניתן להזין קואורדינטות ידנית.
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder="חפשו מקום..."
          />

          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '180px',
              borderRadius: '12px',
              marginTop: '8px',
            }}
          />
        </>
      )}

      <div className="location-manual-inputs">
        <input
          type="number"
          placeholder="Latitude"
          value={latitude ?? ''}
          onChange={(e) =>
            handleManualChange('latitude', e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Longitude"
          value={longitude ?? ''}
          onChange={(e) =>
            handleManualChange('longitude', e.target.value)
          }
        />
      </div>

      {latitude != null && longitude != null && (
        <small>
          📍 {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
        </small>
      )}
    </div>
  );
}