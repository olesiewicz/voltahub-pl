'use strict';

{
  const storageKey = 'voltahub-map-consent-v1';
  const retentionMs = 180 * 24 * 60 * 60 * 1000;
  const settingsButton = document.querySelector('[data-cookie-settings]');
  const map = document.querySelector('[data-google-map]');
  const mapFallback = map?.querySelector('[data-map-fallback]');
  const banner = document.createElement('section');

  banner.id = 'cookie-banner';
  banner.className = 'cookie-banner';
  banner.setAttribute('aria-labelledby', 'cookie-title');
  banner.innerHTML = `
    <div>
      <h2 id="cookie-title">Cookie settings</h2>
      <p>With your consent, VoltaHub will display an embedded Google Map. Google may then use cookies and similar technologies. <a href="privacy.html#mapa-i-cookies">More about privacy</a></p>
    </div>
    <div class="cookie-actions">
      <button type="button" data-consent-choice="reject">Reject</button>
      <button type="button" data-consent-choice="accept">Accept</button>
    </div>`;
  banner.hidden = true;
  document.body.append(banner);

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && saved.expiresAt > Date.now() &&
          (saved.choice === 'accept' || saved.choice === 'reject')) {
        return saved.choice;
      }
      if (saved) localStorage.removeItem(storageKey);
    } catch {
      // The map stays disabled until the visitor makes a choice.
    }
    return null;
  }

  function updateMap(choice) {
    if (!map) return;
    const frame = map.querySelector('iframe');
    const accepted = choice === 'accept';

    if (accepted && !frame) {
      const iframe = document.createElement('iframe');
      iframe.title = 'VoltaHub on Google Maps';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      iframe.src = map.dataset.googleMap;
      map.append(iframe);
    }
    if (!accepted) frame?.remove();
    mapFallback.hidden = accepted;
  }

  function showBanner(open, focus = false) {
    banner.hidden = !open;
    settingsButton.setAttribute('aria-expanded', String(open));
    if (focus) banner.querySelector('button').focus();
  }

  const choice = readChoice();
  settingsButton.hidden = false;
  updateMap(choice);
  showBanner(choice === null);

  let openedFromSettings = false;
  settingsButton.addEventListener('click', () => {
    openedFromSettings = true;
    showBanner(true, true);
  });

  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-consent-choice]');
    if (!button) return;
    const selected = button.dataset.consentChoice;

    try {
      localStorage.setItem(storageKey, JSON.stringify({
        choice: selected,
        expiresAt: Date.now() + retentionMs
      }));
    } catch {
      // The choice still applies on the current page.
    }

    updateMap(selected);
    showBanner(false);
    if (openedFromSettings) settingsButton.focus();
    openedFromSettings = false;
  });

  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    const savedChoice = readChoice();
    updateMap(savedChoice);
    showBanner(savedChoice === null);
  });
}
