/* PWA registration (no frameworks) */
'use strict';

(function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    // Reload when a new SW takes control so users actually get the latest CSS/JS
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    navigator.serviceWorker.register('./service-worker.js')
      .then((reg) => reg.update())
      .catch((err) => {
        console.error('Service worker registration failed:', err);
      });
  });
})();


