const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthToken = () => {
  return localStorage.getItem('notenest_token');
};

const buildHeaders = (customHeaders = {}) => {
  const headers = { ...customHeaders };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  async get(endpoint, queryParams = {}) {
    const url = new URL(BASE_URL + endpoint, window.location.origin);
    Object.keys(queryParams).forEach((key) => {
      const val = queryParams[key];
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, val);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: buildHeaders({
        'Accept': 'application/json',
      }),
    });

    return handleResponse(response);
  },

  async post(endpoint, body = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  async put(endpoint, body = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  async delete(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders({
        'Accept': 'application/json',
      }),
    });

    return handleResponse(response);
  },

  // Upload file via XMLHttpRequest for reliable progress tracking
  upload(endpoint, formData, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}${endpoint}`);

      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.message || 'File upload failed.'));
          }
        } catch (e) {
          reject(new Error('Invalid server response during upload.'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during file upload. Please check your connection.'));
      };

      xhr.send(formData);
    });
  },
};

export default api;

