import { getData, create, update, deleteItem, postRaw } from './client';

export const loginUser = (email, password) =>
  postRaw('/auth/login', { email, password });

export const getUserById = (userId, token) =>
  getData(`/user/${userId}`, token);

export const updateUserProfile = (userId, data, token) =>
  update(`/user/${userId}`, data, token);

export const getUserPlaces = (userId, token) =>
  getData(`/user/${userId}/places`, token);

export const getUserReviews = (userId, token) =>
  getData(`/user/${userId}/reviews`, token);

export const registerUser = (userData) =>
  postRaw('/auth/register', userData);

export const getAllUsers = (token) =>
  getData('/user/', token);

export const deleteUser = (userId, token) =>
  deleteItem(`/user/${userId}`, token);

export const getOnlineUsers = (token) =>
  getData('/user/online', token);

export const updateUser = (userId, data, token) =>
  update(`/user/${userId}`, data, token);

export const createUser = (data, token) =>
  create('/user/', data, token);