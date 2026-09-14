import { API_BASE_URL } from '../config/env';

const request = async (
  path,
  {
    method = 'GET',
    body,
    token,
    isFormData = false,
    retries = 0,
  } = {}
) => {
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  //send the response
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));

      if (response.status === 401 && token) {
        localStorage.removeItem('user');

        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login'
        ) {
          window.location.href = '/login';
        }
      }

      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `[api/client] retrying ${method} ${path} (${retries} retries left)`
      );

      return request(path, {
        method,
        body,
        token,
        isFormData,
        retries: retries - 1,
      });
    }

    console.error(
      `[api/client] request failed: ${method} ${path}`,
      error
    );

    throw error;
  }
};

export const getData = (
  path,
  token,
  retries = 1
) => request(path, {
  method: 'GET',
  token,
  retries,
});

export const create = (
  path,
  newItem,
  token,
  retries = 0
) => request(path, {
  method: 'POST',
  body: newItem,
  token,
  retries,
});

export const update = (
  path,
  changes,
  token,
  retries = 0
) => request(path, {
  method: 'PUT',
  body: changes,
  token,
  retries,
});

export const patchItem = (
  path,
  changes,
  token,
  retries = 0
) => request(path, {
  method: 'PATCH',
  body: changes,
  token,
  retries,
});

export const deleteItem = (
  path,
  token,
  retries = 0
) => request(path, {
  method: 'DELETE',
  token,
  retries,
});

export const uploadFile = (
  path,
  formData,
  token,
  retries = 0
) => request(path, {
  method: 'POST',
  body: formData,
  isFormData: true,
  token,
  retries,
});

export const postRaw = async (
  path,
  body,
  retries = 0
) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response && response.json) {
      return await response.json();
    }
  } catch (error) {
    if (retries > 0) {
      return postRaw(path, body, retries - 1);
    }

    throw error;
  }
};
