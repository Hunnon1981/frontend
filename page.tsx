/**
 * Main Booking Page Component
 * Frontend entry point for towing service booking
 * 
 * Features:
 * - Google Maps autocomplete for addresses
 * - Real-time price calculation via API
 * - Vehicle condition assessment
 * - Photo upload with preview
 * - No pricing logic (100% backend-driven)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import VehicleConditionForm from '@/components/VehicleConditionForm';
import PhotoUpload from '@/components/PhotoUpload';
import PriceBreakdown from '@/components/PriceBreakdown';

interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType: 'sedan' | 'suv' | 'truck' | 'motorcycle';
  vehicleYear?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  condition: 'drivable' | 'minor' | 'moderate' | 'major';
  isEmergency: boolean;
  wheelsRoll?: 'yes' | 'no' | 'unknown';
  steeringWorks?: 'yes' | 'no' | 'unknown';
  stuckLocation?: 'road' | 'parking' | 'dirt' | 'accident' | 'ditch' | 'tight';
  transmissionType?: 'automatic' | 'manual' | 'unknown';
  accessibility?: 'easy' | 'medium' | 'difficult';
  conditionDescription?: string;
  specialInstructions?: string;
  photoUrls: string[];
}

interface PriceCalculation {
  totalPrice: number;
  breakdown: {
    baseFee: number;
    distanceFee: number;
    vehicleSurcharge: number;
    recoverySurcharge: number;
    difficultyFee: number;
    timeOfDayFee: number;
    emergencyFee: number;
  };
  distanceMiles: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  difficultyScore?: number;
  estimatedLoadingMinutes?: number;
}

export default function BookingPage() {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pickupAddress: '',
    pickupLat: 0,
    pickupLng: 0,
    dropoffAddress: '',
    dropoffLat: 0,
    dropoffLng: 0,
    vehicleType: 'sedan',
    condition: 'drivable',
    isEmergency: false,
    photoUrls: []
  });

  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [distanceMiles, setDistanceMiles] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConditionForm, setShowConditionForm] = useState(false);

  // Calculate price whenever relevant fields change
  useEffect(() => {
    if (distanceMiles > 0) {
      calculatePrice();
    }
  }, [
    distanceMiles,
    formData.vehicleType,
    formData.condition,
    formData.isEmergency,
    formData.wheelsRoll,
    formData.steeringWorks,
    formData.stuckLocation,
    formData.transmissionType,
    formData.accessibility
  ]);

  const calculatePrice = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      // Detect time-of-day factors
      const timeOfDay = {
        isLateNight: hour >= 0 && hour < 6,
        isNight: hour >= 21 && hour < 24,
        isRushHour: (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19),
        isWeekend: day === 0 || day === 6,
        isHoliday: false // TODO: Add holiday detection
      };

      const response = await apiClient.post('/pricing/calculate', {
        distanceMiles,
        vehicleType: formData.vehicleType,
        condition: formData.condition,
        isEmergency: formData.isEmergency,
        timeOfDay,
        wheelsRoll: formData.wheelsRoll,
        steeringWorks: formData.steeringWorks,
        stuckLocation: formData.stuckLocation,
        transmissionType: formData.transmissionType,
        accessibility: formData.accessibility
      });

      if (response.data.success) {
        setPriceCalculation(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate price');
      console.error('Price calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickupSelect = async (address: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: address,
      pickupLat: lat,
      pickupLng: lng
    }));

    // Calculate distance if dropoff is also set
    if (formData.dropoffLat !== 0 && formData.dropoffLng !== 0) {
      await calculateDistance(lat, lng, formData.dropoffLat, formData.dropoffLng);
    }
  };

  const handleDropoffSelect = async (address: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      dropoffAddress: address,
      dropoffLat: lat,
      dropoffLng: lng
    }));

    // Calculate distance if pickup is also set
    if (formData.pickupLat !== 0 && formData.pickupLng !== 0) {
      await calculateDistance(formData.pickupLat, formData.pickupLng, lat, lng);
    }
  };

  const calculateDistance = async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ) => {
    try {
      const response = await apiClient.post('/distance/calculate', {
        origin: { lat: originLat, lng: originLng },
        destination: { lat: destLat, lng: destLng }
      });

      if (response.data.success) {
        setDistanceMiles(response.data.data.distanceMiles);
      }
    } catch (err) {
      console.error('Distance calculation error:', err);
    }
  };

  const handleConditionChange = (value: string) => {
    setFormData(prev => ({ ...prev, condition: value as any }));
    setShowConditionForm(value !== 'drivable');
  };

  const handlePhotoUpload = async (files: File[]) => {
    try {
      setLoading(true);
      const uploadedUrls = await apiClient.uploadPhotos(files);
      setFormData(prev => ({ ...prev, photoUrls: uploadedUrls }));
    } catch (err) {
      setError('Failed to upload photos');
      console.error('Photo upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        ...formData,
        distanceMiles,
        calculatedPrice: priceCalculation?.totalPrice || 0,
        difficultyScore: priceCalculation?.difficultyScore,
        difficultyLevel: priceCalculation?.difficultyLevel,
        difficultyFee: priceCalculation?.breakdown.difficultyFee,
        estimatedLoadingMinutes: priceCalculation?.estimatedLoadingMinutes
      };

      const response = await apiClient.post('/bookings', bookingData);

      if (response.data.success) {
        // Redirect to confirmation page
        window.location.href = `/booking/${response.data.data.id}`;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking');
      console.error('Booking submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚗 Express Tow Service
          </h1>
          <p className="text-gray-600 mb-8">
            Fast, reliable towing service with instant pricing
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <section className="border-b pb-6">
              <h2 className="text-2xl font-semibold mb-4">📋 Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.customerName}
                  onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.customerPhone}
                  onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                  className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={formData.customerEmail}
                  onChange={e => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2"
                />
              </div>
            </section>

            {/* Locations */}
            <section className="border-b pb-6">
              <h2 className="text-2xl font-semibold mb-4">📍 Pickup & Dropoff</h2>
              <div className="space-y-4">
                <AddressAutocomplete
                  label="Pickup Location *"
                  placeholder="Enter pickup address"
                  onSelect={handlePickupSelect}
                />
                <AddressAutocomplete
                  label="Dropoff Location *"
                  placeholder="Enter dropoff address"
                  onSelect={handleDropoffSelect}
                />
                {distanceMiles > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-900 font-medium">
                      📏 Distance: {distanceMiles} miles
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Vehicle Information */}
            <section className="border-b pb-6">
              <h2 className="text-2xl font-semibold mb-4">🚙 Vehicle Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.vehicleType}
                  onChange={e => setFormData(prev => ({ ...prev, vehicleType: e.target.value as any }))}
                  className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
                
                <select
                  value={formData.condition}
                  onChange={e => handleConditionChange(e.target.value)}
                  className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="drivable">Drivable Vehicle</option>
                  <option value="minor">Minor Issues</option>
                  <option value="moderate">Moderate Issues</option>
                  <option value="major">Major Issues / Non-Drivable</option>
                </select>

                <input
                  type="number"
                  placeholder="Year (optional)"
                  value={formData.vehicleYear || ''}
                  onChange={e => setFormData(prev => ({ ...prev, vehicleYear: parseInt(e.target.value) || undefined }))}
                  className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Make (optional)"
                  value={formData.vehicleMake || ''}
                  onChange={e => setFormData(prev => ({ ...prev, vehicleMake: e.target.value }))}
                  className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEmergency}
                    onChange={e => setFormData(prev => ({ ...prev, isEmergency: e.target.checked }))}
                    className="w-5 h-5 text-red-600"
                  />
                  <span className="text-gray-700">🚨 Emergency / Priority Service (+$30)</span>
                </label>
              </div>
            </section>

            {/* Vehicle Condition Assessment (Non-Drivable) */}
            {showConditionForm && (
              <VehicleConditionForm
                formData={formData}
                onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
              />
            )}

            {/* Photo Upload */}
            {showConditionForm && (
              <section className="border-b pb-6">
                <h2 className="text-2xl font-semibold mb-4">📸 Vehicle Photos (Optional)</h2>
                <PhotoUpload
                  maxPhotos={3}
                  onUpload={handlePhotoUpload}
                  uploadedPhotos={formData.photoUrls}
                />
              </section>
            )}

            {/* Price Breakdown */}
            {priceCalculation && (
              <PriceBreakdown
                calculation={priceCalculation}
                loading={loading}
              />
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !priceCalculation}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? '⏳ Processing...' : `Book Tow Service - $${priceCalculation?.totalPrice.toFixed(2) || '0.00'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
