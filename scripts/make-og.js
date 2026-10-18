const sharp = require('sharp');
const fs = require('fs');

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #3a6b7c; }
      .win { fill: #c0b89d; stroke: #1c1b18; stroke-width: 4; }
      .bar { fill: #1c1b18; }
      .bar-text { fill: #f6f1e0; font-family: monospace; font-size: 20px; font-weight: bold; }
      .title { fill: #1c1b18; font-family: sans-serif; font-size: 110px; font-weight: 900; }
      .tag { fill: #1c1b18; font-family: monospace; font-size: 32px; font-weight: bold; }
      .sub { fill: #3a382c; font-family: sans-serif; font-size: 24px; font-weight: 500; }
      .badge { fill: #ffd23f; stroke: #1c1b18; stroke-width: 3; }
      .badge-txt { fill: #1c1b18; font-family: monospace; font-size: 18px; font-weight: bold; }
    </style>
  </defs>
  <rect width="1200" height="630" class="bg" />
  
  <!-- Window shadow -->
  <rect x="90" y="55" width="1020" height="520" fill="#141412" opacity="0.6" rx="4" />

  <!-- Retro Window Shell -->
  <g transform="translate(80, 45)">
    <rect width="1020" height="520" class="win" rx="4" />
    <rect width="1020" height="42" class="bar" />
    <text x="20" y="28" class="bar-text">nib_desktop.exe · haX.baby hackathon</text>
    <rect x="970" y="10" width="30" height="22" fill="#c0b89d" stroke="#f6f1e0" stroke-width="1.5" />
    <text x="981" y="26" font-family="monospace" font-size="16" font-weight="bold">X</text>
    
    <!-- Window Body -->
    <text x="70" y="175" class="title">nıb</text>
    <polygon points="144,93 144,119 151,113 156,124 161,121.5 156,111 165,111" fill="#e8412f" stroke="#1c1b18" stroke-width="2" />
    
    <text x="70" y="235" class="tag">Click gently. I'm new here.</text>
    <text x="70" y="280" class="sub">A newborn 4-bit cursor discovering the web,</text>
    <text x="70" y="312" class="sub">one click at a time.</text>
    
    <!-- Badges & Chips -->
    <g transform="translate(70, 360)">
      <rect width="230" height="48" class="badge" rx="2" />
      <text x="115" y="31" text-anchor="middle" class="badge-txt">4 BITS OLD (NIBBLE)</text>
      
      <rect x="250" width="290" height="48" class="badge" rx="2" fill="#7dffb0" />
      <text x="395" y="31" text-anchor="middle" class="badge-txt">TRACK 2: ORIGINAL BABY</text>
    </g>

    <!-- Character NIB Big Illustration -->
    <g transform="translate(780, 135) scale(7)">
      <polygon points="0,0 0,26 7,20 12,31 17,28.5 12,18 21,18" fill="#ffd23f" stroke="#1c1b18" stroke-width="1.5" stroke-linejoin="round" />
      <circle cx="4.4" cy="12" r="2.2" fill="#ffffff" stroke="#1c1b18" stroke-width="0.8" />
      <circle cx="4.4" cy="12" r="1" fill="#1c1b18" />
      <circle cx="9.2" cy="13.3" r="2.2" fill="#ffffff" stroke="#1c1b18" stroke-width="0.8" />
      <circle cx="9.2" cy="13.3" r="1" fill="#1c1b18" />
      <!-- Tail Bow -->
      <polygon points="13,24 17,21 17,27" fill="#ff6fa5" stroke="#1c1b18" stroke-width="0.8" />
      <polygon points="21,24 17,21 17,27" fill="#ff6fa5" stroke="#1c1b18" stroke-width="0.8" />
      <circle cx="17" cy="24" r="1.2" fill="#ffd23f" stroke="#1c1b18" stroke-width="0.6" />
    </g>
  </g>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/og.png')
  .then(() => {
    console.log('og.png generated at public/og.png');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
