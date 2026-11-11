// Update this release record when gameplay or presentation changes.
window.PIXEL_FLIGHT_RELEASE=Object.freeze({version:'1.33.1',releasedOn:'2026-11-11'});
const versionBadge=document.getElementById('game-version');
if(versionBadge){versionBadge.textContent='v'+window.PIXEL_FLIGHT_RELEASE.version;versionBadge.setAttribute('aria-label','Versión actual '+window.PIXEL_FLIGHT_RELEASE.version);}
