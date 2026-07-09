type DemoSheetOptions = {
  labels: string[];
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  sheetIndex: number;
};

export function demoSheetSvgDataUrl({ labels, textColor, strokeColor, strokeWidth, sheetIndex }: DemoSheetOptions) {
  const colors = [
    ["#09a87a", "#2f7dd3", "#ffd166"],
    ["#ef6f6c", "#3d405b", "#f4a261"],
    ["#118ab2", "#06d6a0", "#ffcad4"],
    ["#7c5cff", "#00a896", "#f9c74f"]
  ];

  const cells = Array.from({ length: 8 }, (_, index) => {
    const x = (index % 2) * 512;
    const y = Math.floor(index / 2) * 384;
    const palette = colors[(sheetIndex * 8 + index) % colors.length];
    const label = labels[index] ?? "";

    return `<g transform="translate(${x} ${y})">
      <ellipse cx="256" cy="220" rx="142" ry="122" fill="${palette[0]}"/>
      <circle cx="204" cy="158" r="62" fill="${palette[2]}"/>
      <circle cx="308" cy="158" r="62" fill="${palette[2]}"/>
      <circle cx="218" cy="202" r="16" fill="#1e2528"/>
      <circle cx="294" cy="202" r="16" fill="#1e2528"/>
      <path d="M214 266 Q256 304 300 266" fill="none" stroke="#1e2528" stroke-width="14" stroke-linecap="round"/>
      <text x="256" y="78" text-anchor="middle" font-size="34" font-family="Arial, sans-serif" font-weight="800" paint-order="stroke" stroke="${escapeXml(strokeColor)}" stroke-width="${strokeWidth}" stroke-linejoin="round" fill="${escapeXml(textColor)}">${escapeXml(label)}</text>
    </g>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
    <rect width="1024" height="1536" fill="none"/>
    ${cells}
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
