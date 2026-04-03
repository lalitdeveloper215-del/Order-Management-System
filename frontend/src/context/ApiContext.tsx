import { createContext, useContext, type ReactNode } from "react";
import axios, { type AxiosInstance } from "axios";

interface ApiContextType {
  api: AxiosInstance;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ApiContext.Provider value={{ api }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApiConfig must be used within an ApiProvider");
  }
  return context;
};
