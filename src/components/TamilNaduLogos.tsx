import React from 'react';

// Official Tamil Nadu Government State Emblem (தமிழ்நாடு அரசு சின்னம் - Srivilliputhur Gopuram Tower)
export const TamilNaduStateEmblem: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Government of Tamil Nadu State Emblem"
    >
      {/* Outer circular medallion */}
      <circle cx="60" cy="60" r="56" stroke="#991B1B" strokeWidth="2.5" fill="#FFFDF8" />
      <circle cx="60" cy="60" r="51" stroke="#991B1B" strokeWidth="1" strokeDasharray="2 2" fill="none" />
      <circle cx="60" cy="60" r="48" stroke="#991B1B" strokeWidth="1.5" fill="none" />

      {/* Top Tamil Text Arc: தமிழ்நாடு அரசு */}
      <path id="tn-arc" d="M 24 60 A 36 36 0 0 1 96 60" fill="none" />
      <text fill="#7F1D1D" fontSize="7.5" fontWeight="bold" letterSpacing="0.8">
        <textPath href="#tn-arc" startOffset="50%" textAnchor="middle">
          தமிழ்நாடு அரசு
        </textPath>
      </text>

      {/* Central Gopuram (Temple Tower of Srivilliputhur) */}
      <g id="gopuram" transform="translate(0, 0)">
        {/* Kalasam finial at top */}
        <path d="M 60 27 L 60 22 M 58.5 24 L 61.5 24" stroke="#991B1B" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="60" cy="25" r="1.5" fill="#991B1B" />

        {/* Tier 1 (Topmost) */}
        <polygon points="56,29 64,29 63,33 57,33" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="0.8" />
        {/* Tier 2 */}
        <polygon points="54,34 66,34 65,39 55,39" fill="#991B1B" stroke="#7F1D1D" strokeWidth="0.8" />
        {/* Tier 3 */}
        <polygon points="52,40 68,40 67,46 53,46" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="0.8" />
        {/* Tier 4 */}
        <polygon points="50,47 70,47 69,53 51,53" fill="#991B1B" stroke="#7F1D1D" strokeWidth="0.8" />
        {/* Tier 5 */}
        <polygon points="48,54 72,54 71,61 49,61" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="0.8" />
        {/* Tier 6 (Base Tier) */}
        <polygon points="46,62 74,62 73,70 47,70" fill="#991B1B" stroke="#7F1D1D" strokeWidth="0.8" />

        {/* Gopuram Windows / Niches */}
        <rect x="58.5" y="30" width="3" height="2" fill="#FEF2F2" rx="0.5" />
        <rect x="58" y="35.5" width="4" height="2.5" fill="#FEF2F2" rx="0.5" />
        <rect x="57.5" y="41.5" width="5" height="3.5" fill="#FEF2F2" rx="0.5" />
        <rect x="57" y="48.5" width="6" height="3.5" fill="#FEF2F2" rx="0.5" />
        <rect x="56" y="55.5" width="8" height="4.5" fill="#FEF2F2" rx="0.5" />
        {/* Gateway Arch (Gopuram Entrance) */}
        <path d="M 56 70 A 4 4 0 0 1 64 70 Z" fill="#FEF2F2" stroke="#7F1D1D" strokeWidth="0.6" />

        {/* Flanking Pillars & Decorative Columns */}
        <rect x="44" y="64" width="2" height="6" fill="#7F1D1D" />
        <rect x="74" y="64" width="2" height="6" fill="#7F1D1D" />
      </g>

      {/* Ashoka Lion Capital (Indian National Emblem) representation at base */}
      <g id="lion-capital" transform="translate(0, 0)">
        <rect x="50" y="72" width="20" height="4" fill="#B91C1C" rx="0.5" stroke="#7F1D1D" strokeWidth="0.5" />
        {/* Dharma Chakra in Center */}
        <circle cx="60" cy="74" r="1.5" stroke="#FFF" strokeWidth="0.6" fill="#7F1D1D" />
      </g>

      {/* Flanking Wheat / Grain Sheaves (South Indian Agriculture Crest) */}
      <g id="wreath" stroke="#15803D" strokeWidth="1.2" fill="none">
        {/* Left garland */}
        <path d="M 28 68 Q 30 78 40 85" />
        <path d="M 26 62 Q 28 72 36 80" />
        <circle cx="28" cy="65" r="1.2" fill="#15803D" />
        <circle cx="31" cy="72" r="1.2" fill="#15803D" />
        <circle cx="36" cy="79" r="1.2" fill="#15803D" />

        {/* Right garland */}
        <path d="M 92 68 Q 90 78 80 85" />
        <path d="M 94 62 Q 92 72 84 80" />
        <circle cx="92" cy="65" r="1.2" fill="#15803D" />
        <circle cx="89" cy="72" r="1.2" fill="#15803D" />
        <circle cx="84" cy="79" r="1.2" fill="#15803D" />
      </g>

      {/* Bottom Ribbon / Banner */}
      <g id="banner">
        <path
          d="M 28 88 L 38 85 L 60 86 L 82 85 L 92 88 L 88 94 L 60 92 L 32 94 Z"
          fill="#991B1B"
          stroke="#7F1D1D"
          strokeWidth="0.8"
        />
        {/* Banner Tails */}
        <polygon points="28,88 32,94 25,93" fill="#7F1D1D" />
        <polygon points="92,88 88,94 95,93" fill="#7F1D1D" />

        {/* Tamil Motto: வாய்மையே வெல்லும் (Satyameva Jayate) */}
        <text
          x="60"
          y="90.5"
          fill="#FFFDF8"
          fontSize="4.8"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="0.2"
        >
          வாய்மையே வெல்லும்
        </text>
      </g>

      {/* Decorative Star Accents */}
      <polygon points="32,56 33,58 35,58 33.5,59.5 34,61.5 32,60 30,61.5 30.5,59.5 29,58 31,58" fill="#B91C1C" />
      <polygon points="88,56 89,58 91,58 89.5,59.5 90,61.5 88,60 86,61.5 86.5,59.5 85,58 87,58" fill="#B91C1C" />
    </svg>
  );
};

// National Health Mission (NHM) Tamil Nadu Official Crest
export const NationalHealthMissionLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="National Health Mission Tamil Nadu Logo"
    >
      {/* Outer circular badge */}
      <circle cx="60" cy="60" r="56" stroke="#047857" strokeWidth="2.5" fill="#F0FDF4" />
      <circle cx="60" cy="60" r="51" stroke="#059669" strokeWidth="1" strokeDasharray="2 2" fill="none" />
      <circle cx="60" cy="60" r="48" stroke="#047857" strokeWidth="1.2" fill="none" />

      {/* Red Cross Base Accent */}
      <path
        d="M 52 30 H 68 V 46 H 84 V 62 H 68 V 78 H 52 V 62 H 36 V 46 H 52 Z"
        fill="#DC2626"
        opacity="0.12"
      />

      {/* Top Arc Tamil Text: தேசிய நலவாழ்வு குழுமம் */}
      <path id="nhm-arc-top" d="M 22 60 A 38 38 0 0 1 98 60" fill="none" />
      <text fill="#065F46" fontSize="6.2" fontWeight="bold" letterSpacing="0.4">
        <textPath href="#nhm-arc-top" startOffset="50%" textAnchor="middle">
          தேசிய நலவாழ்வு குழுமம்
        </textPath>
      </text>

      {/* Stylized Family Health Figures (Mother, Child, Father / Community) */}
      <g id="family-symbol" transform="translate(0, 4)">
        {/* Father figure (left) */}
        <circle cx="46" cy="48" r="4" fill="#047857" />
        <path d="M 40 68 C 40 58 44 55 48 55 C 50 55 52 57 52 68 Z" fill="#047857" />

        {/* Mother figure (right) */}
        <circle cx="74" cy="49" r="3.8" fill="#047857" />
        <path d="M 68 68 C 68 59 71 56 75 56 C 79 56 80 60 80 68 Z" fill="#047857" />

        {/* Child in center sheltered with love */}
        <circle cx="60" cy="55" r="3" fill="#DC2626" />
        <path d="M 55 68 C 55 61 58 59 60 59 C 62 59 65 61 65 68 Z" fill="#DC2626" />

        {/* Protective Caduceus / Caring Hands Arc */}
        <path
          d="M 36 66 Q 60 82 84 66"
          stroke="#059669"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 33 60 Q 60 87 87 60"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Bottom Arc Text: TAMIL NADU */}
      <path id="nhm-arc-bot" d="M 94 65 A 36 36 0 0 1 26 65" fill="none" />
      <text fill="#047857" fontSize="5.5" fontWeight="bold" letterSpacing="1">
        <textPath href="#nhm-arc-bot" startOffset="50%" textAnchor="middle">
          NATIONAL HEALTH MISSION
        </textPath>
      </text>
    </svg>
  );
};
