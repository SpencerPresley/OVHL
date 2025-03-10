export interface ImageDimensions {
  width: number;
  height: number;
}

export const Images = {
  // Backgrounds
  GOLD_BANNER: {
    path: '/OVHL_goldbackground_2232 x744.jpg',
    dimensions: {
      width: 2232,
      height: 744,
    },
  },
  BLUE_ICE: {
    path: '/LG_SCRN_OVHL_bkgrnd1920x1080v2.jpg',
    dimensions: {
      width: 1745,
      height: 1398,
    },
  },

  // Logos
  LOGO_MAIN: {
    path: '/TRANS_OVHL_logoFINAL.png',
  },
  LOGO_ANIMATED: {
    path: '/TRANS_GIF_OVHL_logo.gif',
  },
  LOGO_OV3: {
    path: '/TRANS_OV3_logo3.png',
  },
} as const;

// Type for accessing image paths
export type ImageKeys = keyof typeof Images;
