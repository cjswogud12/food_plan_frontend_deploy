import React from 'react';

export default function Logo({ className, width = 100, height = 100 }: { className?: string, width?: number, height?: number }) {
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
            </defs>

            {/* Plate Base */}
            <circle cx="100" cy="100" r="90" fill="url(#plate-gradient)" />

            {/* Plate Inner Rim (Indentation) */}
            <circle cx="100" cy="100" r="65" fill="#8B5CF6" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="2" />

            {/* Plate Highlight (Glassy feel) */}
            <circle cx="100" cy="100" r="85" stroke="url(#rim-gradient)" strokeWidth="4" fill="none" opacity="0.5" />

            {/* Fork (Left side) - Rotated inwards */}
            <g transform="translate(70, 100) rotate(10) translate(-70, -100)">
                {/* Handle */}
                <rect x="63" y="90" width="14" height="80" rx="7" fill="white" filter="url(#soft-shadow)" />
                {/* Neck */}
                <path d="M63 90 Q 70 80 77 90" fill="white" />
                {/* Tines Base */}
                <path d="M59 50 L 63 90 L 77 90 L 81 50 Q 70 60 59 50" fill="white" />
                {/* Tines */}
                <rect x="59" y="30" width="4" height="30" rx="2" fill="white" />
                <rect x="65" y="30" width="4" height="28" rx="2" fill="white" />
                <rect x="71" y="30" width="4" height="28" rx="2" fill="white" />
                <rect x="77" y="30" width="4" height="30" rx="2" fill="white" />
            </g>

            {/* Knife (Right side) - Rotated inwards */}
            <g transform="translate(130, 100) rotate(-10) translate(-130, -100)">
                {/* Handle */}
                <rect x="123" y="90" width="14" height="80" rx="7" fill="white" filter="url(#soft-shadow)" />
                {/* Blade */}
                <path d="M123 90 L 123 30 Q 123 10 137 30 L 137 90 Z" fill="white" />
                {/* Blade Connection */}
                <rect x="123" y="85" width="14" height="5" fill="white" />
            </g>

        </svg>
    );
}
