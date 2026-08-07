#!/usr/bin/env node
/**
 * Procedurally generates the app icon, adaptive icon, splash, and favicon
 * as plain PNGs (no external image tooling). Each asset is an open "ring"
 * mark rendered with the brand gradient, matching the avatar treatment
 * used throughout the app. Run with: node scripts/generate-assets.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets');

// --- CRC32 (standard PNG chunk checksum, ISO/IEC 15948 Annex D) ---
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter type 0 (none) per scanline
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Draws a circular ring with a small gap (an open "C" / circle mark) using
 * a diagonal two-color gradient, optionally over a solid background.
 * A `null` background produces a transparent canvas (for adaptive icon /
 * splash layers that are composited by the OS or app.config backgroundColor).
 */
function makeMark({ width, height, from, to, background, markScale, ringWidth, gapDegrees }) {
  const pixels = Buffer.alloc(width * height * 4);
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  const bgRgb = background ? hexToRgb(background) : null;
  const cx = width / 2;
  const cy = height / 2;
  const outerR = (Math.min(width, height) / 2) * markScale;
  const innerR = outerR * (1 - ringWidth);
  const gapStart = (-90 - gapDegrees / 2) * (Math.PI / 180);
  const gapEnd = (-90 + gapDegrees / 2) * (Math.PI / 180);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let onRing = false;
      if (dist <= outerR && dist >= innerR) {
        const angle = Math.atan2(dy, dx);
        onRing = !(angle > gapStart && angle < gapEnd);
      }

      if (onRing) {
        const t = (x / width + y / height) / 2;
        pixels[idx] = Math.round(lerp(r1, r2, t));
        pixels[idx + 1] = Math.round(lerp(g1, g2, t));
        pixels[idx + 2] = Math.round(lerp(b1, b2, t));
        pixels[idx + 3] = 255;
      } else if (bgRgb) {
        pixels[idx] = bgRgb[0];
        pixels[idx + 1] = bgRgb[1];
        pixels[idx + 2] = bgRgb[2];
        pixels[idx + 3] = 255;
      } else {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      }
    }
  }

  return encodePNG(width, height, pixels);
}

function write(name, buffer) {
  const target = path.join(OUTPUT_DIR, name);
  fs.writeFileSync(target, buffer);
  console.log(`wrote ${path.relative(process.cwd(), target)} (${buffer.length} bytes)`);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const BRAND_FROM = '#2563EB';
const BRAND_TO = '#7C3AED';
const BRAND_BACKGROUND = '#0B1220';

write(
  'icon.png',
  makeMark({
    width: 1024,
    height: 1024,
    from: BRAND_FROM,
    to: BRAND_TO,
    background: BRAND_BACKGROUND,
    markScale: 0.62,
    ringWidth: 0.2,
    gapDegrees: 46,
  })
);

write(
  'adaptive-icon.png',
  makeMark({
    width: 1024,
    height: 1024,
    from: BRAND_FROM,
    to: BRAND_TO,
    background: null,
    markScale: 0.46,
    ringWidth: 0.22,
    gapDegrees: 46,
  })
);

write(
  'splash.png',
  makeMark({
    width: 1200,
    height: 1200,
    from: BRAND_FROM,
    to: BRAND_TO,
    background: null,
    markScale: 0.34,
    ringWidth: 0.2,
    gapDegrees: 46,
  })
);

write(
  'favicon.png',
  makeMark({
    width: 64,
    height: 64,
    from: BRAND_FROM,
    to: BRAND_TO,
    background: BRAND_BACKGROUND,
    markScale: 0.66,
    ringWidth: 0.24,
    gapDegrees: 46,
  })
);

console.log('Done.');
