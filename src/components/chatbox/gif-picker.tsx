'use client';

import React, { useState } from 'react';
import { Grid } from '@giphy/react-components';
import { IGif } from '@giphy/js-types';
import type { SyntheticEvent } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GifPickerProps {
  onGifSelect: (gif: IGif, e: SyntheticEvent<HTMLElement, Event>) => void;
  onClose: () => void;
}

export function GifPicker({ onGifSelect, onClose }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  const fetchGifs = async (offset: number) => {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: '10',
      ...(searchQuery && { q: searchQuery }),
    });

    const response = await fetch(`/api/giphy?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch GIFs');
    }
    return response.json();
  };

  return (
    <div className={isMobile ? "w-full" : "w-[300px] sm:w-[400px]"}>
      <div className="mb-2 p-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search GIFs..."
          className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="h-[300px] overflow-y-auto">
        <Grid
          key={searchQuery}
          onGifClick={(gif, e) => {
            onGifSelect(gif, e);
            onClose();
          }}
          fetchGifs={fetchGifs}
          width={isMobile ? window.innerWidth - 32 : 380}
          columns={2}
          gutter={8}
          noLink={true}
          hideAttribution={true}
        />
      </div>
    </div>
  );
}

export default GifPicker; 
