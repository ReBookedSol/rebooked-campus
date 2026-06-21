import L from "leaflet";

type MapPinTone = "primary" | "destructive" | "accent" | "secondary";

const toneToColor: Record<MapPinTone, string> = {
  primary: "hsl(var(--primary))",
  destructive: "hsl(var(--destructive))",
  accent: "hsl(var(--accent))",
  secondary: "hsl(var(--secondary))",
};

export const createMapPinIcon = (tone: MapPinTone = "primary") => {
  const color = toneToColor[tone];

  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-3px);pointer-events:none;">
        <div style="width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid hsl(var(--background));box-shadow:0 10px 22px hsl(var(--foreground) / 0.18);"></div>
        <div style="margin-top:-2px;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:12px solid ${color};filter:drop-shadow(0 4px 8px hsl(var(--foreground) / 0.16));"></div>
      </div>
    `,
    iconSize: [18, 30],
    iconAnchor: [9, 30],
    popupAnchor: [0, -28],
  });
};
