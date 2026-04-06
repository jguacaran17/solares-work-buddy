import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Vehicle {
  id: string;
  plate: string;
  type: string;
  status: "En obra" | "En ruta" | "Libre";
  lat: number;
  lng: number;
  driver: string;
}

const STATUS_COLORS: Record<string, string> = {
  "En obra": "#2fb7a4",
  "En ruta": "#0f1f3a",
  "Libre": "#888888",
};

const mockVehicles: Vehicle[] = [
  { id: "v1", plate: "4521-GKR", type: "Camión grúa", status: "En obra", lat: 38.6953, lng: -4.1079, driver: "J. Martínez" },
  { id: "v2", plate: "8834-HNV", type: "Retroexcavadora", status: "En ruta", lat: 38.6900, lng: -4.1150, driver: "P. López" },
  { id: "v3", plate: "2290-FLT", type: "Furgoneta", status: "Libre", lat: 38.6980, lng: -4.0980, driver: "Sin asignar" },
  { id: "v4", plate: "5567-JMD", type: "Camión pluma", status: "En obra", lat: 38.6930, lng: -4.1020, driver: "R. García" },
  { id: "v5", plate: "1103-KPS", type: "Dumper", status: "En ruta", lat: 38.6870, lng: -4.1200, driver: "A. Fernández" },
];

const createCircleIcon = (color: string, plate: string) => {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%)">
        <div style="width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>
        <div style="margin-top:2px;background:#fff;border-radius:3px;padding:1px 4px;font-size:9px;font-weight:700;color:#333;box-shadow:0 1px 3px rgba(0,0,0,.2);white-space:nowrap">${plate}</div>
      </div>
    `,
    iconSize: [60, 36],
    iconAnchor: [30, 18],
  });
};

interface TrackingScreenProps {
  visible: boolean;
}

const TrackingScreen = ({ visible }: TrackingScreenProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [filter, setFilter] = useState<string>("Todos");

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [38.693, -4.11],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mockVehicles.forEach((v) => {
      const color = STATUS_COLORS[v.status];
      L.marker([v.lat, v.lng], { icon: createCircleIcon(color, v.plate) }).addTo(map);
    });

    mapInstance.current = map;
  }, []);

  // Fix map size when tab becomes visible
  useEffect(() => {
    if (visible && mapInstance.current) {
      const timer = setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const filtered = filter === "Todos" ? mockVehicles : mockVehicles.filter((v) => v.status === filter);

  const counts = {
    "En obra": mockVehicles.filter((v) => v.status === "En obra").length,
    "En ruta": mockVehicles.filter((v) => v.status === "En ruta").length,
    "Libre": mockVehicles.filter((v) => v.status === "Libre").length,
  };

  return (
    <div className="space-y-3">
      {/* Map */}
      <div className="glass-card rounded-[10px] overflow-hidden" style={{ height: 280 }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {["Todos", "En obra", "En ruta", "Libre"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold border-none cursor-pointer transition-all"
            style={{
              background: filter === s ? (s === "Todos" ? "hsl(var(--foreground))" : STATUS_COLORS[s]) : "hsl(var(--muted))",
              color: filter === s ? "#fff" : "hsl(var(--muted-foreground))",
            }}
          >
            {s} {s !== "Todos" && `(${counts[s as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {/* Vehicle list */}
      <div className="glass-card rounded-[10px] overflow-hidden">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-3 px-3.5 py-3"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: STATUS_COLORS[v.status] }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold">{v.plate}</span>
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                  style={{
                    background: STATUS_COLORS[v.status],
                    color: "#fff",
                  }}
                >
                  {v.status}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{v.type} · {v.driver}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingScreen;
