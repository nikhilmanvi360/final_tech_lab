export interface RequestConfig extends RequestInit {
  data?: any;
}

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

export const api = {
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { data, headers, ...customConfig } = config;

    const configHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    const requestConfig: RequestInit = {
      ...customConfig,
      headers: configHeaders,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const response = await fetch(endpoint, requestConfig);

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          responseData.error || response.statusText || "API request failed",
          response.status,
          responseData,
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error(`API Error on ${endpoint}:`, error);
      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  },

  get<T = any>(endpoint: string, config?: RequestConfig) {
    return api.request<T>(endpoint, { ...config, method: "GET" });
  },

  post<T = any>(endpoint: string, data?: any, config?: RequestConfig) {
    return api.request<T>(endpoint, { ...config, method: "POST", data });
  },

  put<T = any>(endpoint: string, data?: any, config?: RequestConfig) {
    return api.request<T>(endpoint, { ...config, method: "PUT", data });
  },

  delete<T = any>(endpoint: string, config?: RequestConfig) {
    return api.request<T>(endpoint, { ...config, method: "DELETE" });
  },
};
