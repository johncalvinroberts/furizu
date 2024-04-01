export class HTTPClient {
  private baseURL: string;
  private token: string | undefined | null;

  constructor(baseURL: string, token?: string | undefined | null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}/${endpoint}`;
    if (this.token) {
      options.headers = { ...options.headers, Authorization: `Bearer ${this.token}` };
    }
    const response = await fetch(url, options);
    const duplicate = response.clone();
    const json: T = await response.json();
    if (!response.ok) {
      let message = 'Request failed';
      if (!message) {
        message = await duplicate.text();
      }
      throw new Error(message);
    }
    return json;
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data: unknown, options: RequestInit = {}): Promise<T> {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown, options: RequestInit = {}): Promise<T> {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}
