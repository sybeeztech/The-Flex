import { HostawayReview, Property } from './mock-data';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async fetchWithErrorHandling(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Reviews API
  async getReviews(params?: {
    propertyId?: string;
    channel?: string;
    minRating?: number;
    maxRating?: number;
    status?: string;
    isApproved?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.fetchWithErrorHandling(`${API_BASE_URL}/reviews?${queryParams}`);
  }

  async getReviewById(id: number) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/reviews/${id}`);
  }

  async updateReviewApproval(id: number, isApproved: boolean) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/reviews/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    });
  }

  async getReviewsSummary() {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/reviews/summary`);
  }

  // Properties API
  async getProperties() {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/properties`);
  }

  async getPropertyById(id: string) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/properties/${id}`);
  }

  async getPropertyMetrics(id: string) {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/properties/${id}/metrics`);
  }
}

export const apiService = new ApiService();