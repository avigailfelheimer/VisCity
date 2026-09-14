import { getData, uploadFile, deleteItem } from './client';

export const getMedia = (placeId) =>
  getData(`/places/${encodeURIComponent(placeId)}/media`);

export const uploadMedia = (placeId, file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  return uploadFile(`/places/${encodeURIComponent(placeId)}/media`, formData, token);
};

export const deleteMedia = (placeId, mediaId, token) =>
  deleteItem(`/places/${encodeURIComponent(placeId)}/media/${encodeURIComponent(mediaId)}`, token);