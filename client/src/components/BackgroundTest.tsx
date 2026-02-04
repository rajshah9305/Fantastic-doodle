import React from 'react';
import { GeometricBackground, MobileGeometricBackground } from './BackgroundRender';

export const BackgroundTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative overflow-hidden">
      {/* Desktop Background */}
      <div className="hidden md:block">
        <GeometricBackground className="opacity-60" />
      </div>
      
      {/* Mobile Background */}
      <div className="block md:hidden">
        <MobileGeometricBackground className="opacity-70" />
      </div>
      
      {/* Test Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
          <h1 className="text-4xl font-bold text-zinc-800">Background Test</h1>
          <p className="text-zinc-600">Testing geometric background renders</p>
          <div className="flex gap-4 justify-center">
            <div className="w-4 h-4 bg-orange-600 rounded animate-pulse"></div>
            <div className="w-4 h-4 bg-amber-500 rounded animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-4 h-4 bg-orange-400 rounded animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundTest;