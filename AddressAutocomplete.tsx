/**
 * Address Autocomplete Component
 * Google Maps Places Autocomplete integration
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries: ('places')[] = ['places'];

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  onSelect: (address: string, lat: number, lng: number) => void;
}

export default function AddressAutocomplete({
  label,
  placeholder,
  onSelect
}: AddressAutocompleteProps) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const address = place.formatted_address || '';
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        onSelect(address, lat, lng);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          placeholder="Loading Google Maps..."
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Autocomplete
        onLoad={setAutocomplete}
        onPlaceChanged={handlePlaceChanged}
        options={{
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'geometry']
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Autocomplete>
    </div>
  );
}
