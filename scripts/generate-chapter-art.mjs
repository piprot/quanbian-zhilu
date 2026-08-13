import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve(import.meta.dirname, "..", "public", "art");
mkdirSync(outDir, { recursive: true });

const chapters = [
  { id: 1, roman: "I", title: "DIAGNOSE", accent: "#4fd2cc", second: "#f2c14e" },
  { id: 2, roman: "II", title: "BUILD MOMENTUM", accent: "#e9826c", second: "#4db7d6" },
  { id: 3, roman: "III", title: "DEPLOY", accent: "#f2c14e", second: "#57c7a3" },
  { id: 4, roman: "IV", title: "SHIFT THE TIDE", accent: "#4db7d6", second: "#e9826c" },
  { id: 5, roman: "V", title: "EXECUTE", accent: "#57c7a3", second: "#f2c14e" },
  { id: 6, roman: "VI", title: "HOLD POWER", accent: "#e9a35b", second: "#4fd2cc" },
  { id: 7, roman: "VII", title: "INSTITUTIONALIZE", accent: "#4db7d6", second: "#57c7a3" },
  { id: 8, roman: "VIII", title: "BREAKTHROUGH", accent: "#f2c14e", second: "#e9826c" },
  { id: 9, roman: "IX", title: "SUSTAIN", accent: "#57c7a3", second: "#f2c14e" }
];

for (const chapter of chapters) {
  const cx = 820;
  const cy = 330;
  const radius = 130 + (chapter.id % 3) * 26;
  const nodes = [
    [cx - radius * 0.9, cy - radius * 0.55],
    [cx + radius * 0.95, cy - radius * 0.35],
    [cx - radius * 0.55, cy + radius * 0.75],
    [cx + radius * 0.6, cy + radius * 0.8],
    [cx + radius * 0.15, cy - radius * 0.95],
    [cx - radius * 0.2, cy + radius * 0.35]
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1320"/>
      <stop offset="0.55" stop-color="#15283c"/>
      <stop offset="1" stop-color="#081014"/>
    </linearGradient>
    <linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${chapter.accent}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${chapter.accent}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.32" r="0.55">
      <stop offset="0" stop-color="${chapter.second}" stop-opacity="0.3"/>
      <stop offset="1" stop-color="${chapter.second}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <rect y="560" width="1600" height="340" fill="url(#horizon)"/>
  <g fill="#0a131c">
    <path d="M0 720 L180 560 L360 700 L560 520 L760 690 L980 540 L1180 710 L1380 570 L1600 700 L1600 900 L0 900 Z"/>
    <path d="M0 790 L240 660 L460 800 L680 640 L920 790 L1160 650 L1380 800 L1600 700 L1600 900 L0 900 Z" fill-opacity="0.85"/>
  </g>
  <g stroke="#9fb3c8" stroke-opacity="0.07" stroke-width="1">
    <path d="M0 180h1600M0 360h1600M0 540h1600M0 720h1600M200 0v900M400 0v900M600 0v900M800 0v900M1000 0v900M1200 0v900M1400 0v900"/>
  </g>
  <g fill="none" stroke="${chapter.accent}" stroke-opacity="0.5">
    <circle cx="${cx}" cy="${cy}" r="${radius}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.72}" stroke-width="1.2"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.42}" stroke-width="1.2"/>
    <path d="M${cx - radius} ${cy}h${radius * 2}M${cx} ${cy - radius}v${radius * 2}" stroke-opacity="0.22"/>
  </g>
  <g stroke="${chapter.second}" stroke-opacity="0.35" stroke-width="1.4">
    ${nodes
      .map(
        (node) =>
          `<path d="M${cx} ${cy}L${node[0]} ${node[1]}"/>`
      )
      .join("\n    ")}
  </g>
  <g>
    ${nodes
      .map(
        (node, index) =>
          `<circle cx="${node[0]}" cy="${node[1]}" r="${index % 2 === 0 ? 6 : 5}" fill="${index % 2 === 0 ? chapter.second : chapter.accent}" fill-opacity="${0.75 + (index % 3) * 0.08}"/>`
      )
      .join("\n    ")}
    <circle cx="${cx}" cy="${cy}" r="10" fill="${chapter.second}"/>
  </g>
  <g opacity="0.9">
    <rect x="120" y="700" width="260" height="8" rx="4" fill="#15283c"/>
    <rect x="120" y="716" width="${180 + chapter.id * 10}" height="8" rx="4" fill="${chapter.accent}" fill-opacity="0.7"/>
    <rect x="1240" y="700" width="240" height="8" rx="4" fill="#15283c"/>
    <rect x="1240" y="716" width="${120 + chapter.id * 14}" height="8" rx="4" fill="${chapter.second}" fill-opacity="0.7"/>
  </g>
  <text x="80" y="110" fill="#e7eef2" font-size="46" font-family="Georgia, serif" font-weight="700" opacity="0.9">${chapter.roman}</text>
  <text x="80" y="150" fill="${chapter.accent}" font-size="18" font-family="Verdana, sans-serif" letter-spacing="4">${chapter.title}</text>
</svg>
`;
  writeFileSync(resolve(outDir, `chapter-${chapter.id}.svg`), svg, "utf8");
}

const roles = [
  {
    id: "parachute",
    accent: "#4fd2cc",
    second: "#f2c14e",
    skin: "#d7c39a",
    hair: "#2c2c2c"
  },
  {
    id: "founder",
    accent: "#e9826c",
    second: "#f2c14e",
    skin: "#c9a77e",
    hair: "#1f1f22"
  },
  {
    id: "highPotential",
    accent: "#4db7d6",
    second: "#57c7a3",
    skin: "#d9b98a",
    hair: "#33271c"
  }
];

for (const role of roles) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12202e"/>
      <stop offset="1" stop-color="#0a1117"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.34" r="0.7">
      <stop offset="0" stop-color="${role.accent}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${role.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c3348"/>
      <stop offset="1" stop-color="#10202f"/>
    </linearGradient>
  </defs>
  <rect width="200" height="240" fill="url(#bg)"/>
  <rect width="200" height="240" fill="url(#glow)"/>
  <path d="M26 240 C44 182 70 168 100 168 C130 168 156 182 174 240 Z" fill="url(#suit)"/>
  <path d="M100 168 L76 240 L100 218 L124 240 Z" fill="#e9edf2" fill-opacity="0.92"/>
  <path d="M88 168 L100 208 L112 168 Z" fill="${role.second}" fill-opacity="0.9"/>
  <circle cx="100" cy="92" r="50" fill="${role.skin}"/>
  <path d="M50 92c0-28 22-48 50-48s50 20 50 48c-6-18-24-22-50-22s-44 4-50 22Z" fill="${role.hair}"/>
  <path d="M70 92c8 5 22 5 30 0" fill="none" stroke="${role.hair}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="82" cy="92" r="2.5" fill="#18222b"/>
  <circle cx="118" cy="92" r="2.5" fill="#18222b"/>
  <path d="M92 112c5 4 11 4 16 0" fill="none" stroke="#8f6f4f" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="100" cy="54" r="7" fill="${role.second}" fill-opacity="0.85"/>
  <rect x="46" y="190" width="108" height="4" rx="2" fill="${role.accent}" fill-opacity="0.6"/>
</svg>
`;
  writeFileSync(resolve(outDir, `role-${role.id}.svg`), svg, "utf8");
}

console.log(`generated ${chapters.length} chapter art SVGs and ${roles.length} role portraits`);
