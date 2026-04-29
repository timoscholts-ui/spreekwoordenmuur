// src/components/TileWallPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { DelftTile, type DelftTileData } from './Tile';
import './delft-tile.css';
import '../styles/tile-wall.css';

type TileWallPageProps = {
  items: DelftTileData[];
  layout?: 'grid' | 'masonry';
  revealDurationMs?: number;
  title?: string;
  subtitle?: string;
};

export function TileWallPage({
  items,
  layout = 'grid',
  revealDurationMs = 3800,
  title = 'Dutch Sayings on Delft Tiles',
  subtitle = 'A growing wall of spreekwoorden, gezegden, and famous quotes.',
}: TileWallPageProps) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const left = parseDateDisplay(a.dateDisplay);
      const right = parseDateDisplay(b.dateDisplay);
      return right.getTime() - left.getTime();
    });
  }, [items]);

  const newest = sortedItems[0];
  const olderItems = sortedItems.slice(1);

  const [phase, setPhase] = useState<'reveal' | 'settle' | 'wall'>('reveal');

  useEffect(() => {
    const settleTimer = window.setTimeout(
      () => setPhase('settle'),
      Math.max(revealDurationMs - 1200, 1200),
    );
    const wallTimer = window.setTimeout(() => setPhase('wall'), revealDurationMs);
    return () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(wallTimer);
    };
  }, [revealDurationMs]);

  const wallClassName = [
    'tile-wall',
    layout === 'masonry' ? 'tile-wall-masonry' : 'tile-wall-grid',
  ].join(' ');

  return (
    <main className="tile-wall-page">
      <a className="tile-wall-skip" href="#tile-wall-grid">
        Skip to tile wall
      </a>

      <section className="tile-wall-hero">
        <div className="tile-wall-copy">
          <p className="tile-wall-eyebrow">Daily Dutch wisdom</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>

      {newest && (
        <div
          className={[
            'tile-wall-reveal-layer',
            phase !== 'wall' ? 'is-visible' : '',
            phase === 'settle' ? 'is-settling' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={phase === 'wall'}
        >
          <div className="tile-wall-reveal-shell">
            <p className="tile-wall-reveal-label">New tile of the day</p>
            <DelftTile
              data={newest}
              autoReveal
              className="tile-wall-feature-tile"
            />
          </div>
        </div>
      )}

      <section className="tile-wall-section">
        <div className="tile-wall-section-header">
          <div>
            <p className="tile-wall-section-label">Wall archive</p>
            <h2>Every day adds a new tile</h2>
          </div>
          <p className="tile-wall-section-text">
            The newest tile appears first, flips open, and then settles into the wall.
          </p>
        </div>

        <div id="tile-wall-grid" className={wallClassName}>
          {newest && (
            <div
              className={[
                'tile-wall-cell',
                'tile-wall-cell--newest',
                phase === 'wall' ? 'is-resting' : 'is-waiting',
              ].join(' ')}
            >
              <DelftTile
                data={newest}
                defaultFlipped={phase !== 'reveal'}
              />
            </div>
          )}

          {olderItems.map((item) => (
            <div
              className="tile-wall-cell"
              key={`${item.dateDisplay}-${item.saying}`}
            >
              <DelftTile data={item} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function parseDateDisplay(value: string): Date {
  const [day = '01', month = '01', year = '00'] = value.split('/');
  const fullYear = Number(year) < 100 ? 2000 + Number(year) : Number(year);
  return new Date(fullYear, Number(month) - 1, Number(day));
}
