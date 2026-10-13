import { useEffect, useState } from 'react';
import './MilestoneBanner.css';
import type { Banner } from '../hooks/useGameEvents';

interface MilestoneBannerProps {
  banner: Banner | null;
}

const VISIBLE_DURATION_MS = 3600;

export function MilestoneBanner({ banner }: MilestoneBannerProps) {
  const [visibleBanner, setVisibleBanner] = useState<Banner | null>(null);

  useEffect(() => {
    if (!banner) return;
    setVisibleBanner(banner);
    const timeout = window.setTimeout(() => setVisibleBanner(null), VISIBLE_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [banner]);

  if (!visibleBanner) return null;

  return (
    <div key={visibleBanner.id} className="milestone-banner">
      {visibleBanner.message}
    </div>
  );
}
