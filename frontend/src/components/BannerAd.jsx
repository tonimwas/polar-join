import React, { useEffect, useState, useRef } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const BannerAd = () => {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web' || !visible) {
      return; // AdMob does not work on web or banner hidden
    }

    const showBanner = async () => {
      try {
        const options = {
          adId: 'ca-app-pub-8025011479298297/1682483809', // Production banner ad unit ID
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false, // IMPORTANT: Set to false for production
        };
        await AdMob.showBanner(options);
      } catch (error) {
        console.error('Error showing banner ad:', error);
      }
    };

    // Initialize and show banner
    AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: false, // IMPORTANT: Set to false for production
    }).then(() => {
      showBanner();
    }).catch(err => console.error("Error initializing AdMob", err));

    return () => {
      // Keep any pending timer so the banner can reshow automatically
      if (Capacitor.getPlatform() !== 'web') {
        AdMob.hideBanner().catch(() => {});
      }
    };
  }, [visible]);

  if (!visible || Capacitor.getPlatform() === 'web') return null;

  // Render a simple close button overlaying the bottom of the screen
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 60, // slightly above banner height
        right: 10,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
      }}
      onClick={async () => {
        try {
          await AdMob.hideBanner();
        } catch (err) {
          console.error('Error hiding banner', err);
        }
        setVisible(false);
        // schedule banner to reappear after 2 minutes (120000 ms)
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setVisible(true);
        }, 120000);
      }}
    >
      <span style={{ color: '#fff', fontSize: 16 }}>✖️</span>
    </div>
  );
};

export default BannerAd;
