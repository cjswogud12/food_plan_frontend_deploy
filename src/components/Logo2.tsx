import React from 'react';

export default function Logo2({ className, width = 100, height = 100 }: { className?: string, width?: number, height?: number }) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                {/* Plate Gradient */}
                <linearGradient id="plate-gradient" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#DDD6FE" /> {/* Very Light Purple */}
                    <stop offset="100%" stopColor="#A78BFA" /> {/* Purple 400 */}
                </linearGradient>

                {/* Glass/Rim Effect */}
                <linearGradient id="rim-gradient" x1="50" y1="50" x2="150" y2="150" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                </linearGradient>

                <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Spork Shadow */}
                <filter id="spork-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.1" />
                </filter>
            </defs>

            {/* Plate Base */}
            <circle cx="100" cy="100" r="90" fill="url(#plate-gradient)" />

            {/* Plate Inner Rim (Indentation) */}
            <circle cx="100" cy="100" r="65" fill="#8B5CF6" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="2" />

            {/* Plate Highlight (Glassy feel) */}
            <circle cx="100" cy="100" r="85" stroke="url(#rim-gradient)" strokeWidth="4" fill="none" opacity="0.5" />

            {/* Spork (Center) */}
            <g transform="translate(100, 100) translate(-100, -100)" filter="url(#spork-shadow)">
                {/* Handle */}
                <path d="M96 110 L 93 180 Q 93 190 100 190 Q 107 190 107 180 L 104 110" fill="white" />

                {/* Spoon Head Base */}
                <ellipse cx="100" cy="80" rx="18" ry="25" fill="white" />

                {/* Spork Tines (Cutouts to shape tines) */}
                {/* Tine 1 (Left) */}
                <path d="M90 60 L 92 75 L 94 60" fill="white" />
                {/* Tine 2 (Middle) */}
                <path d="M98 60 L 100 75 L 102 60" fill="white" />
                {/* Tine 3 (Right) */}
                <path d="M106 60 L 108 75 L 110 60" fill="white" />

                {/* Refined Tines Shape (Subtracting from the ellipse visually or drawing simplified tines) */}
                {/* Simulating Spork Tines by drawing the 'negative' space or drawing the fork shape explicitly */}
                <path d="
          M88 65 
          Q 88 95 100 95
          Q 112 95 112 65
          L 112 70 
          L 100 110
          L 88 70 
          Z
        " fill="white" style={{ display: 'none' }} /> {/* Placeholder logic */}

                {/* Actual Spork Head Shape */}
                <path d="
            M86 70 
            C 86 95, 114 95, 114 70
            L 114 62 L 109 68 L 106 58
            L 103 68 L 100 58
            L 97 68 L 94 58
            L 91 68 L 86 62
            Z
        " fill="white" />

                {/* Smooth connection to handle */}
                <path d="M95 90 Q 100 105 105 90 L 105 90 L 95 90" fill="white" />

                {/* Better Spork Shape Construction */}
                <g>
                    {/* Spoon Body */}
                    <path d="M85 70 C 85 100, 115 100, 115 70 L 115 65 L 85 65 Z" fill="white" />
                    {/* Tines */}
                    <path d="M86 70 L 88 55 L 90 70" fill="white" />
                    <path d="M93 72 L 95 55 L 97 72" fill="white" />
                    <path d="M103 72 L 105 55 L 107 72" fill="white" />
                    <path d="M110 70 L 112 55 L 114 70" fill="white" />

                    {/* Re-doing the head cleanly */}
                    <path d="
             M 86 70 
             Q 86 95 100 95 
             Q 114 95 114 70
             L 112 55 L 108 65 L 105 55 L 100 65 L 95 55 L 92 65 L 88 55
             Z
           " fill="white" />
                    <path d="M92 92 L 95 95 L 105 95 L 108 92" fill="white" />
                </g>
            </g>

            {/* Final Clean Spork Path */}
            <g transform="translate(100, 100) translate(-100, -100)" filter="url(#spork-shadow)">
                {/* Handle */}
                <path d="M96 100 L 95 175 Q 95 185 100 185 Q 105 185 105 175 L 104 100" fill="white" />

                {/* Head */}
                <path d="
            M 85 65
            C 85 90, 115 90, 115 65
            L 115 62 
            L 112 50 L 108 62
            L 105 50 L 100 62
            L 95 50 L 92 62
            L 88 50 L 85 62
            Z
          " fill="white" />
            </g>

        </svg>
    );
}
