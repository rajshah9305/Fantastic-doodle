import React from 'react';

interface BackgroundRenderProps {
  className?: string;
}

export const GeometricBackground: React.FC<BackgroundRenderProps> = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.4" />
          </linearGradient>
          
          <linearGradient id="peachGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#fdba74" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.3" />
          </linearGradient>
          
          <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#fef3c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.2" />
          </linearGradient>

          {/* Animated gradient for floating effect */}
          <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.9">
              <animate attributeName="stop-opacity" values="0.9;0.6;0.9" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7">
              <animate attributeName="stop-opacity" values="0.7;0.4;0.7" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.5">
              <animate attributeName="stop-opacity" values="0.5;0.2;0.5" dur="5s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Main Geometric Shapes */}
        {/* Central Crystal Formation */}
        <g className="animate-float">
          <polygon
            points="400,150 450,200 400,250 350,200"
            fill="url(#orangeGradient)"
            stroke="#ea580c"
            strokeWidth="1"
            opacity="0.8"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 400 200;360 400 200"
              dur="20s"
              repeatCount="indefinite"
            />
          </polygon>
          
          <polygon
            points="400,200 480,240 400,280 320,240"
            fill="url(#peachGradient)"
            stroke="#f59e0b"
            strokeWidth="1"
            opacity="0.7"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 400 240;-360 400 240"
              dur="25s"
              repeatCount="indefinite"
            />
          </polygon>
          
          <polygon
            points="400,250 460,290 400,330 340,290"
            fill="url(#lightGradient)"
            stroke="#fed7aa"
            strokeWidth="1"
            opacity="0.6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 400 290;360 400 290"
              dur="30s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* Surrounding Geometric Elements */}
        <g opacity="0.6">
          {/* Left side crystals */}
          <polygon
            points="150,180 200,220 150,260 100,220"
            fill="url(#orangeGradient)"
            stroke="#ea580c"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 150 220;360 150 220"
              dur="15s"
              repeatCount="indefinite"
            />
          </polygon>
          
          <polygon
            points="80,300 120,340 80,380 40,340"
            fill="url(#peachGradient)"
            stroke="#f59e0b"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 80 340;-360 80 340"
              dur="18s"
              repeatCount="indefinite"
            />
          </polygon>

          {/* Right side crystals */}
          <polygon
            points="650,180 700,220 650,260 600,220"
            fill="url(#animatedGradient)"
            stroke="#ea580c"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 650 220;-360 650 220"
              dur="22s"
              repeatCount="indefinite"
            />
          </polygon>
          
          <polygon
            points="720,300 760,340 720,380 680,340"
            fill="url(#lightGradient)"
            stroke="#fed7aa"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 720 340;360 720 340"
              dur="16s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* Connecting Lines/Wireframe */}
        <g stroke="#ea580c" strokeWidth="0.5" fill="none" opacity="0.3">
          <line x1="400" y1="150" x2="150" y2="180">
            <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="400" y1="150" x2="650" y2="180">
            <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="400" y1="330" x2="80" y2="380">
            <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="5s" repeatCount="indefinite" />
          </line>
          <line x1="400" y1="330" x2="720" y2="380">
            <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="3.5s" repeatCount="indefinite" />
          </line>
          
          {/* Triangular connections */}
          <polygon
            points="400,200 150,220 80,340"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="0.3"
            opacity="0.2"
          />
          <polygon
            points="400,200 650,220 720,340"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="0.3"
            opacity="0.2"
          />
        </g>

        {/* Floating Particles */}
        <g>
          <circle cx="200" cy="100" r="2" fill="#ea580c" opacity="0.6">
            <animate attributeName="cy" values="100;120;100" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="600" cy="120" r="1.5" fill="#f59e0b" opacity="0.5">
            <animate attributeName="cy" values="120;140;120" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="300" cy="450" r="2.5" fill="#fb923c" opacity="0.4">
            <animate attributeName="cy" values="450;470;450" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="500" cy="480" r="1" fill="#fed7aa" opacity="0.7">
            <animate attributeName="cy" values="480;500;480" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
};

export const MobileGeometricBackground: React.FC<BackgroundRenderProps> = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 375 812"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="mobileOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.5" />
          </linearGradient>
          
          <linearGradient id="mobilePeachGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fdba74" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.4" />
          </linearGradient>
          
          <radialGradient id="mobileRadialGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fef3c7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Central Crystal Formation - Mobile Optimized */}
        <g className="animate-float">
          <polygon
            points="187.5,200 237.5,250 187.5,300 137.5,250"
            fill="url(#mobileOrangeGradient)"
            stroke="#ea580c"
            strokeWidth="1.5"
            opacity="0.9"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 187.5 250;360 187.5 250"
              dur="20s"
              repeatCount="indefinite"
            />
          </polygon>
          
          <polygon
            points="187.5,250 267.5,300 187.5,350 107.5,300"
            fill="url(#mobilePeachGradient)"
            stroke="#f59e0b"
            strokeWidth="1"
            opacity="0.8"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 187.5 300;-360 187.5 300"
              dur="25s"
              repeatCount="indefinite"
            />
          </polygon>
          
          <polygon
            points="187.5,300 247.5,350 187.5,400 127.5,350"
            fill="url(#mobileRadialGradient)"
            stroke="#fed7aa"
            strokeWidth="0.8"
            opacity="0.7"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 187.5 350;360 187.5 350"
              dur="30s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* Side Elements - Mobile Optimized */}
        <g opacity="0.6">
          {/* Left side */}
          <polygon
            points="50,150 90,190 50,230 10,190"
            fill="url(#mobileOrangeGradient)"
            stroke="#ea580c"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 50 190;360 50 190"
              dur="15s"
              repeatCount="indefinite"
            />
          </polygon>
          
          {/* Right side */}
          <polygon
            points="325,150 365,190 325,230 285,190"
            fill="url(#mobilePeachGradient)"
            stroke="#f59e0b"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 325 190;-360 325 190"
              dur="18s"
              repeatCount="indefinite"
            />
          </polygon>

          {/* Bottom elements */}
          <polygon
            points="100,600 140,640 100,680 60,640"
            fill="url(#mobileRadialGradient)"
            stroke="#fed7aa"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 100 640;360 100 640"
              dur="22s"
              repeatCount="indefinite"
            />
          </polygon>
          
          <polygon
            points="275,600 315,640 275,680 235,640"
            fill="url(#mobileOrangeGradient)"
            stroke="#ea580c"
            strokeWidth="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 275 640;-360 275 640"
              dur="16s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* Connecting Lines - Mobile Optimized */}
        <g stroke="#ea580c" strokeWidth="0.3" fill="none" opacity="0.25">
          <line x1="187.5" y1="200" x2="50" y2="150">
            <animate attributeName="stroke-opacity" values="0.25;0.1;0.25" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="187.5" y1="200" x2="325" y2="150">
            <animate attributeName="stroke-opacity" values="0.25;0.1;0.25" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="187.5" y1="400" x2="100" y2="600">
            <animate attributeName="stroke-opacity" values="0.25;0.1;0.25" dur="5s" repeatCount="indefinite" />
          </line>
          <line x1="187.5" y1="400" x2="275" y2="600">
            <animate attributeName="stroke-opacity" values="0.25;0.1;0.25" dur="3.5s" repeatCount="indefinite" />
          </line>
        </g>

        {/* Mobile Floating Particles */}
        <g>
          <circle cx="80" cy="100" r="1.5" fill="#ea580c" opacity="0.6">
            <animate attributeName="cy" values="100;120;100" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="295" cy="120" r="1" fill="#f59e0b" opacity="0.5">
            <animate attributeName="cy" values="120;140;120" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="700" r="2" fill="#fb923c" opacity="0.4">
            <animate attributeName="cy" values="700;720;700" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="225" cy="750" r="0.8" fill="#fed7aa" opacity="0.7">
            <animate attributeName="cy" values="750;770;750" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
};

export default GeometricBackground;