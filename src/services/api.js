import axios from 'axios';
// export const BASE_URL = "https://saga.bahia.fiocruz.br/api";
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// export const BASE_URL = "https://vsdbm-api.hfabio.dev";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

export default api;