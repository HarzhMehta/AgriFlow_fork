"use client";

import { useEffect } from "react";
export default function RemoveGoogleTranslateUI() {
  useEffect(() => {
    function hideTranslateUI() {
      try {

        // Hide gadget icon/menu but DO NOT remove classes like 'skiptranslate'
        document.querySelectorAll('.skiptranslate')
          .forEach((el) => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          });

        // reset offsets in case the banner pushed content down
        if (document.body) document.body.style.top = '0';
        if (document.documentElement) document.documentElement.style.top = '0';
      } catch (e) {
        // swallow errors
      }
    }

  // Immediate attempt to hide any banner already present
  hideTranslateUI();

    // MutationObserver to remove when inserted
  const observer = new MutationObserver(() => hideTranslateUI());
    try {
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (e) {
      // schedule a delayed attach if body isn't ready
      setTimeout(() => {
        try { observer.observe(document.body || document.documentElement, { childList: true, subtree: true }); } catch (_) {}
      }, 100);
    }

    // Short interval loop for the first 10 seconds (catches late inserts)
    let attempts = 0;
    const maxAttempts = 40; // 40 * 250ms = 10s
    const interval = setInterval(() => {
  hideTranslateUI();
      attempts += 1;
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 250);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}
