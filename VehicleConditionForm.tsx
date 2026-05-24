/**
 * Vehicle Condition Form Component
 * Non-drivable vehicle inspection questionnaire
 */

'use client';

import React from 'react';

interface VehicleConditionFormProps {
  formData: {
    wheelsRoll?: 'yes' | 'no' | 'unknown';
    steeringWorks?: 'yes' | 'no' | 'unknown';
    stuckLocation?: 'road' | 'parking' | 'dirt' | 'accident' | 'ditch' | 'tight';
    transmissionType?: 'automatic' | 'manual' | 'unknown';
    accessibility?: 'easy' | 'medium' | 'difficult';
    conditionDescription?: string;
  };
  onChange: (updates: Partial<VehicleConditionFormProps['formData']>) => void;
}

export default function VehicleConditionForm({ formData, onChange }: VehicleConditionFormProps) {
  return (
    <section className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-amber-900 flex items-center gap-2">
        ⚠️ Vehicle Condition Assessment
      </h2>
      <p className="text-amber-700 text-sm">
        Please answer these questions to help us prepare the right equipment and provide accurate pricing.
      </p>

      {/* Wheels Roll */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Can the wheels roll freely? *
        </label>
        <div className="flex gap-4">
          {['yes', 'no', 'unknown'].map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="wheelsRoll"
                value={option}
                checked={formData.wheelsRoll === option}
                onChange={(e) => onChange({ wheelsRoll: e.target.value as any })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Steering Works */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Is the steering working? *
        </label>
        <div className="flex gap-4">
          {['yes', 'no', 'unknown'].map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="steeringWorks"
                value={option}
                checked={formData.steeringWorks === option}
                onChange={(e) => onChange({ steeringWorks: e.target.value as any })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stuck Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Where is the vehicle located? *
        </label>
        <select
          value={formData.stuckLocation || ''}
          onChange={(e) => onChange({ stuckLocation: e.target.value as any })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select location...</option>
          <option value="road">On Road (Easy Access)</option>
          <option value="parking">Parking Garage / Lot</option>
          <option value="dirt">Dirt / Sand / Off-Road</option>
          <option value="accident">Accident Scene</option>
          <option value="ditch">Ditch / Embankment</option>
          <option value="tight">Tight Space / Limited Access</option>
        </select>
      </div>

      {/* Transmission Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transmission type *
        </label>
        <select
          value={formData.transmissionType || ''}
          onChange={(e) => onChange({ transmissionType: e.target.value as any })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select transmission...</option>
          <option value="automatic">Automatic</option>
          <option value="manual">Manual</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {/* Accessibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How accessible is the vehicle for our tow truck? *
        </label>
        <div className="space-y-2">
          {[
            { value: 'easy', label: 'Easy', desc: 'Clear access, flat ground, no obstacles' },
            { value: 'medium', label: 'Medium', desc: 'Some obstacles, tight space, or uneven ground' },
            { value: 'difficult', label: 'Difficult', desc: 'Very tight space, steep incline, or major obstacles' }
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.accessibility === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="accessibility"
                value={option.value}
                checked={formData.accessibility === option.value}
                onChange={(e) => onChange({ accessibility: e.target.value as any })}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional details (optional)
        </label>
        <textarea
          value={formData.conditionDescription || ''}
          onChange={(e) => onChange({ conditionDescription: e.target.value })}
          placeholder="Describe any specific issues, damage, or concerns..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Note:</strong> These details help us bring the right equipment and provide accurate pricing. 
          The final price may adjust slightly after our driver inspects the vehicle on-site.
        </p>
      </div>
    </section>
  );
}
