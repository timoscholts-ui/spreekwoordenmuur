// src/App.tsx
import sayingsData from './data/sayings.json';
import type { Saying } from './types';
import { TileWallPage } from './components/TileWallPage';
import type { DelftTileData } from './components/Tile';

function toTileData(s: Saying): DelftTileData {
  return {
    dateDisplay: s.dateDisplay,
    saying: s.saying,
    literalDunglish: s.literalDunglish,
    contextNl: s.contextNl,
    explanationEn: s.explanationEn,
    askUrl: s.askPerplexityUrl,
  };
}

export default function App() {
  const items = (sayingsData as Saying[]).map(toTileData);

  return (
    <TileWallPage
      items={items}
      layout="grid"
      revealDurationMs={13200}
      eyebrow="Van je collega's"
      title="Alena's Spreekwoordenmuur"
      subtitle="Op kantoor leerden we je hoe Nederlanders écht praten. Nu je weg bent, blijven de spreekwoorden komen — elke dag één."
    />
  );
}
