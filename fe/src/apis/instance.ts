import axios, { isAxiosError } from "axios";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_BE_URL}/apis`,
});

export default instance;

instance.interceptors.response.use(undefined, function (error) {
  // Abstract away axios outside of the `apis` layer
  if (isAxiosError(error) && error.response?.data) {
    return Promise.reject(error.response?.data);
  }

  return Promise.reject(error);
});
