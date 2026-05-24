/**
 * API Client
 * Centralized HTTP client for all backend API calls
 * Handles authentication, error handling, and request formatting
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    // Request interceptor (add auth token if available)
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor (handle errors globally)
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication token management
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Generic HTTP methods
  async get(url: string, config = {}) {
    return this.client.get(url, config);
  }

  async post(url: string, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url: string, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url: string, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url: string, config = {}) {
    return this.client.delete(url, config);
  }

  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string) {
    const response = await this.post('/auth/login', { email, password });
    if (response.data.data?.token) {
      this.setAuthToken(response.data.data.token);
    }
    return response.data;
  }

  async logout() {
    this.clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  // ==================== PRICING ====================

  async calculatePrice(data: {
    distanceMiles: number;
    vehicleType: string;
    condition: string;
    isEmergency: boolean;
    timeOfDay: any;
    wheelsRoll?: string;
    steeringWorks?: string;
    stuckLocation?: string;
    transmissionType?: string;
    accessibility?: string;
  }) {
    return this.post('/pricing/calculate', data);
  }

  async getPricingConfig() {
    return this.get('/pricing/config');
  }

  // ==================== DISTANCE ====================

  async calculateDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    return this.post('/distance/calculate', { origin, destination });
  }

  // ==================== BOOKINGS ====================

  async createBooking(data: any) {
    return this.post('/bookings', data);
  }

  async getBooking(id: string) {
    return this.get(`/bookings/${id}`);
  }

  async getAllBookings(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}) {
    return this.get('/admin/bookings', { params });
  }

  async updateBookingStatus(id: string, data: any) {
    return this.patch(`/admin/bookings/${id}/status`, data);
  }

  async cancelBooking(id: string, reason?: string) {
    return this.post(`/admin/bookings/${id}/cancel`, { reason });
  }

  async getBookingStats() {
    return this.get('/admin/bookings/stats');
  }

  // ==================== PHOTOS ====================

  async uploadPhotos(files: File[], bookingId?: string): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });
    if (bookingId) {
      formData.append('bookingId', bookingId);
    }

    const response = await this.client.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data.photos.map((photo: any) => photo.fileUrl);
  }

  async getBookingPhotos(bookingId: string) {
    return this.get(`/photos/${bookingId}`);
  }

  async deletePhoto(id: string) {
    return this.delete(`/admin/photos/${id}`);
  }

  // ==================== ADMIN ====================

  async getDashboardStats() {
    return this.get('/admin/stats');
  }

  async getRecentBookings(limit = 10) {
    return this.get('/admin/bookings/recent', { params: { limit } });
  }

  async updatePricingConfig(config: any) {
    return this.put('/admin/pricing-config', config);
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck() {
    return this.get('/health');
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing
export default APIClient;
