export function demoSvgDataUrl(label: string, index: number) {
  const colors = [
    ["#09a87a", "#2f7dd3", "#ffd166"],
    ["#ef6f6c", "#3d405b", "#f4a261"],
    ["#118ab2", "#06d6a0", "#ffcad4"],
    ["#7c5cff", "#00a896", "#f9c74f"]
  ][index % 4];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <rect width="1024" height="1024" fill="none"/>
    <ellipse cx="512" cy="560" rx="300" ry="260" fill="${colors[0]}"/>
    <circle cx="400" cy="430" r="132" fill="${colors[2]}"/>
    <circle cx="624" cy="430" r="132" fill="${colors[2]}"/>
    <circle cx="420" cy="510" r="34" fill="#1e2528"/>
    <circle cx="604" cy="510" r="34" fill="#1e2528"/>
    <path d="M410 650 Q512 730 614 650" fill="none" stroke="#1e2528" stroke-width="32" stroke-linecap="round"/>
    <rect x="182" y="116" width="660" height="170" rx="72" fill="${colors[1]}"/>
    <text x="512" y="228" text-anchor="middle" font-size="72" font-family="Arial, sans-serif" font-weight="800" fill="#fff">${escapeXml(label)}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
