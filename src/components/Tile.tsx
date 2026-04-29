import { useEffect, useRef, useState } from 'react';
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
  return (
    <svg
      className="delft-tile-border"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Porcelain tile body */}
      <rect width="400" height="400" fill="#f8faff" />

      {/* Bevel — top and left highlight */}
      <path d="M 0,0 L 400,0 L 380,20 L 20,20 L 20,380 L 0,400 Z" fill="rgba(255,255,255,0.6)" />

      {/* Bevel — bottom and right shadow */}
      <path d="M 400,0 L 400,400 L 0,400 L 20,380 L 380,380 L 380,20 Z" fill="rgba(18,30,56,0.07)" />

      {/* Outer border */}
      <rect x="5" y="5" width="390" height="390" fill="none" stroke={C} strokeWidth="7" />

      {/* Top scrollwork */}
      <path
        d="M 68,22 C 73,15 83,15 88,22 C 93,29 103,29 108,22 C 113,15 123,15 128,22
           C 133,29 143,29 148,22 C 153,15 163,15 168,22 C 173,29 183,29 188,22
           C 193,15 203,15 208,22 C 213,29 223,29 228,22 C 233,15 243,15 248,22
           C 253,29 263,29 268,22 C 273,15 283,15 288,22 C 293,29 303,29 308,22
           C 313,15 323,15 328,22"
        fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Bottom scrollwork */}
      <path
        d="M 68,378 C 73,385 83,385 88,378 C 93,371 103,371 108,378 C 113,385 123,385 128,378
           C 133,371 143,371 148,378 C 153,385 163,385 168,378 C 173,371 183,371 188,378
           C 193,385 203,385 208,378 C 213,371 223,371 228,378 C 233,385 243,385 248,378
           C 253,371 263,371 268,378 C 273,385 283,385 288,378 C 293,371 303,371 308,378
           C 313,385 323,385 328,378"
        fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Left scrollwork */}
      <path
        d="M 22,68 C 15,73 15,83 22,88 C 29,93 29,103 22,108 C 15,113 15,123 22,128
           C 29,133 29,143 22,148 C 15,153 15,163 22,168 C 29,173 29,183 22,188
           C 15,193 15,203 22,208 C 29,213 29,223 22,228 C 15,233 15,243 22,248
           C 29,253 29,263 22,268 C 15,273 15,283 22,288 C 29,293 29,303 22,308
           C 15,313 15,323 22,328"
        fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Right scrollwork */}
      <path
        d="M 378,68 C 385,73 385,83 378,88 C 371,93 371,103 378,108 C 385,113 385,123 378,128
           C 371,133 371,143 378,148 C 385,153 385,163 378,168 C 371,173 371,183 378,188
           C 385,193 385,203 378,208 C 371,213 371,223 378,228 C 385,233 385,243 378,248
           C 371,253 371,263 378,268 C 385,273 385,283 378,288 C 371,293 371,303 378,308
           C 385,313 385,323 378,328"
        fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Corner dots */}
      <circle cx="22" cy="22" r="4" fill={C} opacity="0.55" />
      <circle cx="378" cy="22" r="4" fill={C} opacity="0.55" />
      <circle cx="22" cy="378" r="4" fill={C} opacity="0.55" />
      <circle cx="378" cy="378" r="4" fill={C} opacity="0.55" />

      {/* Corner "Pp" — top-left */}
      <text x="11" y="37" fontFamily="Times New Roman, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill={C}>Pp</text>
      {/* Corner "Pp" — top-right */}
      <text x="389" y="37" textAnchor="end" fontFamily="Times New Roman, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill={C}>Pp</text>
      {/* Corner "Pp" — bottom-left */}
      <text x="11" y="393" fontFamily="Times New Roman, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill={C}>Pp</text>
      {/* Corner "Pp" — bottom-right */}
      <text x="389" y="393" textAnchor="end" fontFamily="Times New Roman, serif" fontStyle="italic" fontWeight="bold" fontSize="20" fill={C}>Pp</text>
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
