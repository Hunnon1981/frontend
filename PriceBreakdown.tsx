/**
 * Price Breakdown Component
 * Displays detailed pricing calculation results
 */

'use client';

import React from 'react';

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

interface PriceBreakdownProps {
  calculation: PriceCalculation;
  loading?: boolean;
}

export default function PriceBreakdown({ calculation, loading }: PriceBreakdownProps) {
  const { totalPrice, breakdown, distanceMiles, difficultyLevel, difficultyScore, estimatedLoadingMinutes } = calculation;

  const difficultyColors = {
    easy: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '✅' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'ℹ️' },
    hard: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '⚠️' }
  };

  const difficultyStyle = difficultyLevel ? difficultyColors[difficultyLevel] : null;

  return (
    <section className={`border-2 rounded-xl p-6 ${loading ? 'opacity-50' : ''}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        💰 Price Breakdown
        {loading && <span className="text-sm font-normal text-gray-500">(Calculating...)</span>}
      </h2>

      {/* Difficulty Level (if non-drivable) */}
      {difficultyLevel && difficultyStyle && (
        <div className={`${difficultyStyle.bg} ${difficultyStyle.border} border-2 rounded-lg p-4 mb-4`}>
          <div className={`flex items-center justify-between ${difficultyStyle.text} font-semibold`}>
            <span className="flex items-center gap-2">
              <span className="text-2xl">{difficultyStyle.icon}</span>
              <span>Recovery Difficulty: {difficultyLevel.toUpperCase()}</span>
            </span>
            {difficultyScore !== undefined && (
              <span className="text-sm">(Score: {difficultyScore}/100)</span>
            )}
          </div>
          {estimatedLoadingMinutes && (
            <p className="text-sm mt-2">
              ⏱️ Estimated On-Site Time: <strong>{estimatedLoadingMinutes} minutes</strong>
            </p>
          )}
        </div>
      )}

      {/* Price Details */}
      <div className="space-y-3">
        <PriceRow label="Base Service Fee" amount={breakdown.baseFee} />
        <PriceRow 
          label={`Distance (${distanceMiles.toFixed(1)} miles)`} 
          amount={breakdown.distanceFee} 
        />
        
        {breakdown.vehicleSurcharge > 0 && (
          <PriceRow label="Vehicle Type Surcharge" amount={breakdown.vehicleSurcharge} />
        )}
        
        {breakdown.recoverySurcharge > 0 && (
          <PriceRow label="Recovery Fee (Base)" amount={breakdown.recoverySurcharge} />
        )}
        
        {breakdown.difficultyFee > 0 && (
          <PriceRow 
            label="Difficulty Fee" 
            amount={breakdown.difficultyFee}
            highlight={true}
          />
        )}
        
        {breakdown.timeOfDayFee > 0 && (
          <PriceRow label="Time-of-Day Surcharge" amount={breakdown.timeOfDayFee} />
        )}
        
        {breakdown.emergencyFee > 0 && (
          <PriceRow 
            label="Emergency Service" 
            amount={breakdown.emergencyFee}
            highlight={true}
          />
        )}

        <div className="border-t-2 border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">Total Price</span>
            <span className="text-3xl font-bold text-blue-600">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          ℹ️ <strong>Note:</strong> Final price may adjust slightly after driver inspection if conditions differ. 
          This estimate is based on the information provided.
        </p>
      </div>
    </section>
  );
}

interface PriceRowProps {
  label: string;
  amount: number;
  highlight?: boolean;
}

function PriceRow({ label, amount, highlight }: PriceRowProps) {
  return (
    <div className={`flex justify-between items-center py-2 ${highlight ? 'font-semibold' : ''}`}>
      <span className="text-gray-700">{label}</span>
      <span className={`${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {amount > 0 ? `+$${amount.toFixed(2)}` : '$0.00'}
      </span>
    </div>
  );
}
