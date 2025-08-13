import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

let accessToken: string | null = null;
let refreshTokenValue: string | null = localStorage.getItem('refreshToken');

export function setTokens(at: string | null, rt?: string | null) {
  accessToken = at;
  if (rt !== undefined) {
    refreshTokenValue = rt;
    if (rt) localStorage.setItem('refreshToken', rt);
    else localStorage.removeItem('refreshToken');
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && refreshTokenValue) {
      original._retry = true;
      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
      } else {
        isRefreshing = true;
        try {
          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: refreshTokenValue });
          setTokens(data.accessToken, data.refreshToken);
          queue.forEach((fn) => fn());
        } catch (e) {
          setTokens(null, null);
          throw e;
        } finally {
          isRefreshing = false;
          queue = [];
        }
      }
      return api(original);
    }
    throw error;
  }
);

export default api;