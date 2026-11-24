const paths = {
  flask: '<path d="M9 3h6m-5 0v6l-5.4 8.7A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-3.3L14 9V3M7 15h10"/><path d="M10 18h.01m4-1h.01"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
  compare: '<rect x="3.5" y="5" width="6" height="14" rx="1.2"/><rect x="14.5" y="5" width="6" height="14" rx="1.2"/>',
  book: '<path d="M12 5.5C9.5 3.5 6 3.2 3 4v14c3-.8 6.5-.5 9 1.5 2.5-2 6-2.3 9-1.5V4c-3-.8-6.5-.5-9 1.5Zm0 0v14"/>',
  reset: '<path d="M3 12a9 9 0 1 1 2.6 6.4M3 6v6h6"/>',
  undo: '<path d="m9 6-5 5 5 5m-5-5h10a5 5 0 0 1 5 5v2"/>',
  sliders: '<path d="M4 7h7m4 0h5M4 12h3m4 0h9M4 17h10m4 0h2"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="16" cy="17" r="2"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  expand: '<path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/>',
  brain: '<path d="M12 5.5c-1.6-3.3-6-2.5-6.1 1A3.9 3.9 0 0 0 4 12.7a4.1 4.1 0 0 0 2.3 6A3.2 3.2 0 0 0 12 18m0-12.5c1.6-3.3 6-2.5 6.1 1a3.9 3.9 0 0 1 1.9 6.2 4.1 4.1 0 0 1-2.3 6A3.2 3.2 0 0 1 12 18m0-12.5V18M6 6.5l2 2m10-2-2 2M4 12.7l3 1.3M20 12.7 17 14"/>',
  heart: '<path d="M20.5 8.7c0 4.2-5.1 8.3-8.5 10.8C8.6 17 3.5 12.9 3.5 8.7c0-4.8 6-6.4 8.5-2.1 2.5-4.3 8.5-2.7 8.5 2.1Z"/><path d="M4 11.5h4l1.5-3 2.5 6 1.5-3h6"/>',
  raas: '<path d="M7 5h10M7 19h10m-5-14v14"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><circle cx="12" cy="12" r="2.5" fill="var(--icon-fill, #111b29)"/>',
  kidney: '<path d="M9.4 4.2C5.3 2.2 2 5.7 2.5 10.5c.4 5.7 4.5 8.5 7.2 6.1 1.9-1.7 1-4.1-.5-5.3-1.4-1-1.2-2.6-.1-3.6 1.1-1 .9-2.7.3-3.5Zm5.2 0C18.7 2.2 22 5.7 21.5 10.5c-.4 5.7-4.5 8.5-7.2 6.1-1.9-1.7-1-4.1.5-5.3 1.4-1 1.2-2.6.1-3.6-1.1-1-.9-2.7-.3-3.5ZM10 13h1v7m3-7h-1v7"/>',
  cell: '<ellipse cx="12" cy="12" rx="8.7" ry="7.2" transform="rotate(-20 12 12)"/><ellipse cx="12" cy="12" rx="3.1" ry="2.5" transform="rotate(-20 12 12)"/><path d="M7 11h.01m9 3h.01m-.5-5h.01"/>',
  drop: '<path d="M12 3c2 3.4 6.5 8.5 6.5 12a6.5 6.5 0 0 1-13 0c0-3.5 4.5-8.6 6.5-12Z"/><path d="M9 15.5c.1 1.6 1.3 2.5 2.5 2.7"/>',
  pulse: '<path d="M3 12h4l2.5-6 4.5 12 2.5-6H21"/>',
  play: '<path d="M8 5v14l11-7-11-7Z" fill="currentColor" stroke-linejoin="round"/>',
  pause: '<path d="M9 5v14m6-14v14" stroke-width="2.8"/>',
  step: '<path d="m6 6 9 6-9 6V6Zm12 0v12"/>',
  predict: '<path d="M9 18h6m-5 3h4m-6-6a6 6 0 1 1 8 0c-.7.6-1 1-1 2H9c0-1-.3-1.4-1-2Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  lock: '<rect x="5.5" y="10" width="13" height="10" rx="2"/><path d="M8.5 10V7a3.5 3.5 0 1 1 7 0v3M12 14v2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  target: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14m-7-7v14"/>',
  routes: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h8a4 4 0 1 1 0 8H9a3 3 0 0 0 0 6h8"/>',
}

export function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
}
