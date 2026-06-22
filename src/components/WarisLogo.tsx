import React from 'react';

interface WarisLogoProps {
  /**
   * Layout variation.
   * - 'icon-only': Only the emblem badge (perfect for sticky headers)
   * - 'vertical': Full emblem with the stacked "Waris" and "Rahbiyah" text below (perfect for print covers, landing)
   * - 'horizontal': Emblem on the left and text on the right (perfect for responsive document headers)
   */
  variant?: 'icon-only' | 'vertical' | 'horizontal';
  /**
   * Overall height of the component.
   */
  height?: number | string;
  /**
   * Additional CSS classes.
   */
  className?: string;
  /**
   * Whether to force light colors (useful when placed on dark backgrounds like the dark emerald header).
   */
  lightHeaderMode?: boolean;
}

export const WarisLogo: React.FC<WarisLogoProps> = ({
  variant = 'icon-only',
  height,
  className = '',
  lightHeaderMode = false
}) => {
  // Brand color constant definitions matching the requested design
  const EMERALD_DARK = '#05513c'; // Deep emerald green matching the new official image
  const EMERALD_DEFAULT = '#047857'; // Main theme green
  const GOLD_LIGHT = '#c59b27'; // Metallic Gold from the new official image
  const GOLD_DARK = '#b68f23'; // Classic Gold from the new official image
  const TEXT_GOLD = '#c59b27'; // Logo specific gold text color

  // Style attributes based on mode - optimized for contrast
  const greenFill = lightHeaderMode ? '#ffffff' : EMERALD_DARK;
  const greenStroke = lightHeaderMode ? '#ffffff' : EMERALD_DARK;
  const goldFill = lightHeaderMode ? '#fbbf24' : TEXT_GOLD;
  const goldStroke = lightHeaderMode ? '#fbbf24' : TEXT_GOLD;

  const renderSvgIcon = (sizeStyle: React.CSSProperties) => (
    <svg
      viewBox="0 0 400 400"
      style={sizeStyle}
      className="select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. pointed Islamic dome arch */}
      {/* Outer green arch path */}
      <path
        d="M 80,310 L 80,180 C 80,120 140,80 200,40 C 260,80 320,120 320,180 L 320,310"
        fill="none"
        stroke={greenFill}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner gold arch path */}
      <path
        d="M 98,300 L 98,185 C 98,135 150,100 200,65 C 250,100 302,135 302,185 L 302,300"
        fill="none"
        stroke={goldFill}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* 2. Top golden star */}
      <path
        d="M 200,85 Q 200,97 212,97 Q 200,97 200,109 Q 200,97 188,97 Q 200,97 200,85 Z"
        fill={goldFill}
      />

      {/* 3. Elegantly overlapping "WR" Serif Initials */}
      <g>
        {/* 'W' in Deep Green */}
        <text
          x="132"
          y="215"
          fontFamily="Georgia, Cambria, 'Times New Roman', Times, serif"
          fontSize="115"
          fontWeight="900"
          fill={greenFill}
          letterSpacing="-3"
        >
          W
        </text>
        {/* 'R' in Gold overlapping gracefully */}
        <text
          x="208"
          y="215"
          fontFamily="Georgia, Cambria, 'Times New Roman', Times, serif"
          fontSize="115"
          fontWeight="900"
          className="italic"
          fill={goldFill}
        >
          R
        </text>
      </g>

      {/* 4. Open Book Layers at the base */}
      <g>
        {/* Layer 1: Left page (Gold shadow page underneath) */}
        <path
          d="M 200,315 Q 140,270 50,290 C 70,305 130,295 200,345 Z"
          fill={goldFill}
          opacity="0.8"
        />
        {/* Layer 1: Right page (Gold shadow page underneath) */}
        <path
          d="M 200,315 Q 260,270 350,290 C 330,305 270,295 200,345 Z"
          fill={goldFill}
          opacity="0.8"
        />

        {/* Layer 2: Left page (Emerald page on top) */}
        <path
          d="M 200,320 Q 140,280 30,310 L 60,335 Q 140,305 200,355 Z"
          fill={greenStroke}
        />
        {/* Layer 2: Right page (Emerald page on top) */}
        <path
          d="M 200,320 Q 260,280 370,310 L 340,335 Q 260,305 200,355 Z"
          fill={greenStroke}
        />
      </g>

      {/* 5. Center grow sprout leaf (symbol of inheritance succession & family roots) */}
      <g>
        {/* Left leaf */}
        <path
          d="M 200,315 C 180,300 155,285 158,298 C 160,308 185,325 200,328 Z"
          fill={greenFill}
        />
        {/* Right leaf */}
        <path
          d="M 200,315 C 220,300 245,285 242,298 C 240,308 215,325 200,328 Z"
          fill={greenFill}
        />
        {/* Stem */}
        <path
          d="M 200,328 Q 200,310 200,295"
          fill="none"
          stroke={greenFill}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );

  // Layout presentation mappings
  if (variant === 'icon-only') {
    const defaultHeight = height || '44px';
    return (
      <div className={`inline-flex items-center justify-center ${className}`} style={{ height: defaultHeight, width: defaultHeight }}>
        {renderSvgIcon({ width: '100%', height: '100%' })}
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Scalable Icon */}
        {renderSvgIcon({ width: height || '120px', height: height || '120px' })}
        
        {/* Logo Typography - Stacked */}
        <div className="mt-3 flex flex-col items-center">
          {/* "Waris" text in deep emerald, with a decorated gold star on top of 'i' */}
          <div className="relative font-bold text-3xl tracking-wide leading-none font-serif select-none flex items-center justify-center">
            <span style={{ color: greenFill }}>War</span>
            <span className="relative inline-block leading-none">
              {/* Star on top of 'i' icon dot replace */}
              <span 
                className="absolute left-1/2 -translate-x-1/2 -top-2 text-xs select-none"
                style={{ color: goldFill, fontSize: '11px', transform: 'translateX(-50%) scale(1.1)' }}
              >
                ✦
              </span>
              <span style={{ color: greenFill }}>is</span>
            </span>
            <span style={{ color: goldFill }} className="font-serif ml-2">Rahbiyah</span>
          </div>
          {/* Tagline under vertical logo */}
          <div 
            className="text-[10px] font-semibold tracking-wider mt-2 select-none font-sans"
            style={{ color: lightHeaderMode ? '#a7f3d0' : EMERALD_DARK }}
          >
            Mewarisi Ilmu, Menebar Kebaikan, Meraih Ridha
          </div>
        </div>
      </div>
    );
  }

  // 'horizontal' layout structure with strict brand allegiance (Divider, Custom Colors, Tagline)
  return (
    <div className={`flex items-center gap-3 md:gap-4 ${className}`}>
      {/* Icon portion */}
      {renderSvgIcon({ width: height || '56px', height: height || '56px' })}

      {/* Vertical divider line matching official graphic */}
      <div 
        className="w-[1.5px] h-10 md:h-12 shrink-0 opacity-80"
        style={{ backgroundColor: goldStroke }}
      />

      {/* Typography portion */}
      <div className="flex flex-col justify-center pr-1 select-none">
        <div className="flex items-center font-bold text-xl md:text-2xl tracking-normal leading-none font-serif">
          <span style={{ color: greenFill }}>War</span>
          <span className="relative inline-block leading-none mr-2">
            <span 
              className="absolute left-1/2 -translate-x-1/2 -top-1.5 text-[9px] md:text-[10px] leading-none"
              style={{ color: goldFill }}
            >
              ✦
            </span>
            <span style={{ color: greenFill }}>is</span>
          </span>
          <span style={{ color: goldFill }}>Rahbiyah</span>
        </div>
        
        {/* Official tagline beneath header */}
        <div 
          className="text-[8px] md:text-[10px] whitespace-nowrap mt-1 leading-none font-sans font-medium opacity-90"
          style={{ color: lightHeaderMode ? '#d1fae5' : EMERALD_DARK }}
        >
          Mewarisi Ilmu, Menebar Kebaikan, Meraih Ridha
        </div>
      </div>
    </div>
  );
};
