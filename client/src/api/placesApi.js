import { getData, create, update, deleteItem } from './client';

export const getPlaces = async ({ page = 1, limit = 20, search = '', category = '', open_on = '' } = {}) => {
  const query = new URLSearchParams();
  if (page)     query.set('page',    page);
  if (limit)    query.set('limit',   limit);
  if (search)   query.set('search',  search);
  if (category) query.set('category', category);
  if (open_on)  query.set('open_on', open_on);

  const data = await getData(`/places?${query.toString()}`);

  if (data && data.places) {
    data.places = data.places.map(place => ({
      ...place,
      created_by: place.created_by_id || place.created_by,
      latitude: place.latitude != null ? Number(place.latitude) : null,
      longitude: place.longitude != null ? Number(place.longitude) : null,
    }));
  }

  return data;
};

export const getPlaceById = async (id) => {
  const data = await getData(`/places/${encodeURIComponent(id)}`);

  // המרה אוטומטית של created_by_id ל-created_by למקום בודד
  if (data) {
    data.created_by = data.created_by_id || data.created_by;
    // המרת latitude/longitude ל-Number עבור מפת Google
    data.latitude = data.latitude != null ? Number(data.latitude) : null;
    data.longitude = data.longitude != null ? Number(data.longitude) : null;
  }

  return data;
};

export const createPlace = (placeData, token) =>
  create('/places', placeData, token);

export const updatePlace = (id, placeData, token) =>
  update(`/places/${encodeURIComponent(id)}`, placeData, token);

export const deletePlace = (id, token) =>
  deleteItem(`/places/${encodeURIComponent(id)}`, token);