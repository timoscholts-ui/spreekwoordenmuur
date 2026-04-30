import { useEffect, useId, useRef, useState } from 'react';
import './delft-tile.css';

export type DelftTileData = {
  dateDisplay: string;
  saying: string;
  literalDunglish: string;
  contextNl: string;
  explanationEn: string;
  askUrl?: string;
};

const C = '#1e3d72';

function TileBorder() {
  const uid = useId().replace(/:/g, '');
  const gGloss  = `g-${uid}`;
  const gSheen  = `s-${uid}`;
  const gBevH   = `bh-${uid}`;
  const gBevS   = `bs-${uid}`;

  return (
    <svg
      className="delft-tile-border"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Bevel highlight — top-left corner fades toward bottom-right */}
        <linearGradient id={gBevH} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.92" />
          <stop offset="60%"  stopColor="white" stopOpacity="0.28" />
          <stop offset="100%" stopColor="white" stopOpacity="0.06" />
        </linearGradient>

        {/* Bevel shadow — bottom-right corner deepens toward corner */}
        <linearGradient id={gBevS} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1e3d72" stopOpacity="0.00" />
          <stop offset="55%"  stopColor="#1e3d72" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#1e3d72" stopOpacity="0.16" />
        </linearGradient>

        {/* Gloss — soft oval highlight from upper-left, like a light source overhead */}
        <radialGradient id={gGloss} cx="30%" cy="22%" r="62%" fx="22%" fy="14%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.55" />
          <stop offset="38%"  stopColor="white" stopOpacity="0.14" />
          <stop offset="72%"  stopColor="white" stopOpacity="0.03" />
          <stop offset="100%" stopColor="white" stopOpacity="0.00" />
        </radialGradient>

        {/* Sheen — faint diagonal surface shimmer */}
        <linearGradient id={gSheen} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="white"   stopOpacity="0.18" />
          <stop offset="42%"  stopColor="white"   stopOpacity="0.03" />
          <stop offset="100%" stopColor="#1e3d72" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Porcelain tile body */}
      <rect width="400" height="400" fill="#f8faff" />

      {/* Bevel — top and left, gradient highlight */}
      <path d="M 0,0 L 400,0 L 380,20 L 20,20 L 20,380 L 0,400 Z" fill={`url(#${gBevH})`} />

      {/* Bevel — bottom and right, gradient shadow */}
      <path d="M 400,0 L 400,400 L 0,400 L 20,380 L 380,380 L 380,20 Z" fill={`url(#${gBevS})`} />

      {/* Gloss overlay — porcelain light reflection */}
      <rect width="400" height="400" fill={`url(#${gGloss})`} />

      {/* Surface sheen — subtle diagonal shimmer across the whole face */}
      <rect width="400" height="400" fill={`url(#${gSheen})`} />

      {/* Top scrollwork — center y=32, oscillates y=25..39, clear of 20px bevel */}
      <path
        d="M 68,32 C 73,25 83,25 88,32 C 93,39 103,39 108,32 C 113,25 123,25 128,32
           C 133,39 143,39 148,32 C 153,25 163,25 168,32 C 173,39 183,39 188,32
           C 193,25 203,25 208,32 C 213,39 223,39 228,32 C 233,25 243,25 248,32
           C 253,39 263,39 268,32 C 273,25 283,25 288,32 C 293,39 303,39 308,32
           C 313,25 323,25 328,32"
        fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Bottom scrollwork — center y=368, oscillates y=361..375 */}
      <path
        d="M 68,368 C 73,375 83,375 88,368 C 93,361 103,361 108,368 C 113,375 123,375 128,368
           C 133,361 143,361 148,368 C 153,375 163,375 168,368 C 173,361 183,361 188,368
           C 193,375 203,375 208,368 C 213,361 223,361 228,368 C 233,375 243,375 248,368
           C 253,361 263,361 268,368 C 273,375 283,375 288,368 C 293,361 303,361 308,368
           C 313,375 323,375 328,368"
        fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Left scrollwork — center x=32, oscillates x=25..39 */}
      <path
        d="M 32,68 C 25,73 25,83 32,88 C 39,93 39,103 32,108 C 25,113 25,123 32,128
           C 39,133 39,143 32,148 C 25,153 25,163 32,168 C 39,173 39,183 32,188
           C 25,193 25,203 32,208 C 39,213 39,223 32,228 C 25,233 25,243 32,248
           C 39,253 39,263 32,268 C 25,273 25,283 32,288 C 39,293 39,303 32,308
           C 25,313 25,323 32,328"
        fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Right scrollwork — center x=368, oscillates x=361..375 */}
      <path
        d="M 368,68 C 375,73 375,83 368,88 C 361,93 361,103 368,108 C 375,113 375,123 368,128
           C 361,133 361,143 368,148 C 375,153 375,163 368,168 C 361,173 361,183 368,188
           C 375,193 375,203 368,208 C 361,213 361,223 368,228 C 375,233 375,243 368,248
           C 361,253 361,263 368,268 C 375,273 375,283 368,288 C 361,293 361,303 368,308
           C 375,313 375,323 368,328"
        fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Corner dots — 34px from each edge, inside bevel */}
      <circle cx="34" cy="34" r="4" fill={C} opacity="0.55" />
      <circle cx="366" cy="34" r="4" fill={C} opacity="0.55" />
      <circle cx="34" cy="366" r="4" fill={C} opacity="0.55" />
      <circle cx="366" cy="366" r="4" fill={C} opacity="0.55" />

      {/* Corner "Pp" — all positioned inside safe zone (>20px from edge) */}
      <text x="26" y="60" fontFamily="Times New Roman, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill={C}>Pp</text>
      <text x="374" y="60" textAnchor="end" fontFamily="Times New Roman, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill={C}>Pp</text>
      <text x="26" y="372" fontFamily="Times New Roman, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill={C}>Pp</text>
      <text x="374" y="372" textAnchor="end" fontFamily="Times New Roman, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill={C}>Pp</text>
    </svg>
  );
}

type DelftTileProps = {
  data: DelftTileData;
  autoReveal?: boolean;
  className?: string;
  defaultFlipped?: boolean;
};

export function DelftTile({ data, autoReveal, className, defaultFlipped }: DelftTileProps) {
  const [flipped, setFlipped] = useState(defaultFlipped ?? false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const settling = useRef(false);

  useEffect(() => {
    if (defaultFlipped !== undefined) setFlipped(defaultFlipped);
  }, [defaultFlipped]);

  useEffect(() => {
    if (!autoReveal) return;
    const timer = window.setTimeout(() => setFlipped(true), 6000);
    return () => window.clearTimeout(timer);
  }, [autoReveal]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({ x: -dy * 2, y: dx * -3 });
  }

  function handleMouseLeave() {
    settling.current = true;
    setTilt({ x: 0, y: 0 });
  }

  const isIdle = tilt.x === 0 && tilt.y === 0;

  return (
    <div
      className={['delft-tile-scene', className].filter(Boolean).join(' ')}
      style={{
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isIdle ? 'transform 0.5s ease' : 'transform 0.1s ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setFlipped((f) => !f);
      }}
      aria-label={`Tegel: ${data.saying}`}
      aria-pressed={flipped}
    >
      <div className={`delft-tile-card${flipped ? ' is-flipped' : ''}`}>

        {/* FRONT */}
        <div className="delft-tile-face delft-tile-front">
          <TileBorder />
          <div className="delft-tile-content delft-tile-front-content">
            <p className="delft-tile-date">{data.dateDisplay}</p>
            <p className="delft-tile-saying">{data.saying}</p>
            <hr className="delft-tile-divider" />
            <p className="delft-tile-dunglish-front">{data.literalDunglish}</p>
          </div>
        </div>

        {/* BACK */}
        <div className="delft-tile-face delft-tile-back">
          <TileBorder />
          <div className="delft-tile-content delft-tile-back-content">
            <p className="delft-tile-back-context">{data.contextNl}</p>
            <p className="delft-tile-back-explanation">{data.explanationEn}</p>
            {data.askUrl && (
              <a
                className="delft-tile-ask-link"
                href={data.askUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Meer weten ↗
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
