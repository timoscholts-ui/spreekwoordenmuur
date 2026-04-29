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
    const timer = window.setTimeout(() => setFlipped(true), 650);
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
        <div className="delft-tile-face delft-tile-front">
          <div className="delft-tile-corner delft-tile-corner--tl" />
          <div className="delft-tile-corner delft-tile-corner--tr" />
          <div className="delft-tile-corner delft-tile-corner--bl" />
          <div className="delft-tile-corner delft-tile-corner--br" />
          <div className="delft-tile-front-content">
            <p className="delft-tile-date">{data.dateDisplay}</p>
            <p className="delft-tile-saying">{data.saying}</p>
          </div>
        </div>

        <div className="delft-tile-face delft-tile-back">
          <p className="delft-tile-back-dunglish">{data.literalDunglish}</p>
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
              Ask more ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
