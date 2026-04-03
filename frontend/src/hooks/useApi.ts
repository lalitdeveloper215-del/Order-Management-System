import { useState, useCallback } from "react";
import { useApiConfig } from "../context/ApiContext";

export const useApi = () => {
    const { api } = useApiConfig();
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async <T,>(request: Promise<any>): Promise<T | null> => {
        try {
            setError(null);
            const response = await request;
            return response.data.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "An error occurred");
            return null;
        }
    }, []);

    return { api, execute, error, setError };
};
