import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";
const client = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.message || err?.message || "Request failed";
    const error = new Error(message);
    error.status = err?.response?.status;
    error.data = err?.response?.data;
    throw error;
  }
);

export const api = {
  async postDeploy() {
    const { data } = await client.post("/deploy");
    return data;
  },
  async getDeployStatus(id) {
    const { data } = await client.get(`/deploy/status/${id}`);
    return data;
  },
  async getDeployments() {
    const { data } = await client.get("/deployments");
    return data;
  },
  async retryDeployment(id) {
    const { data } = await client.post(`/deploy/${id}/retry`);
    return data;
  },
  async getScripts() {
    const { data } = await client.get("/scripts");
    return data;
  },
  async createScript(payload) {
    const { data } = await client.post("/scripts", payload);
    return data;
  },
  async updateScript(id, payload) {
    const { data } = await client.put(`/scripts/${id}`, payload);
    return data;
  },
  async deleteScript(id) {
    const { data } = await client.delete(`/scripts/${id}`);
    return data;
  },
};


