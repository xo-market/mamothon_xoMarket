import axios from "axios";

// Base URL for the backend (Update with your actual backend URL)
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://xo-data-service-573278035810.us-central1.run.app";
// Create a default Axios instance for normal JSON requests
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // Timeout after 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a function to return an Axios instance for file uploads
const apiMultipart = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Slightly longer timeout for uploads
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export { api, apiMultipart };
