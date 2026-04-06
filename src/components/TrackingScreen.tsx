import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDown } from "lucide-react";
import type { WorkerTipo } from "@/lib/mock-data";

interface Passenger {
  name: string;
  avatar: string;
  tipo: WorkerTipo;
}

interface Vehicle {
  id: string;
  plate: string;
  type: string;
  status: "En obra" | "En ruta" | "Libre";
  lat: number;
  lng: number;
  driver: string;
  driverTipo: WorkerTipo;
  departureTime: string;
  estimatedArrival: string;
  destination: string;
  passengers: Passenger[];
}

const STATUS_COLORS: Record<string, string> = {
  "En obra": "#2fb7a4",
  "En ruta": "#0f1f3a",
  "Libre": "#888888",
};

const TIPO_COLORS: Record<WorkerTipo, string> = {
  DESP: "#d97706",
  LOCAL: "#2fb7a4",
  FIELD: "#0f1f3a",
};

const TIPO_LABELS: Record<WorkerTipo, string> = {
  DESP: "DESP",
  LOCAL: "LOC",
  FIELD: "FLD",
};

const mockVehicles: Vehicle[] = [
  {
    id: "v1", plate: "8432-BKM", type: "Renault Trafic", status: "En obra",
    lat: 38.6953, lng: -4.1079, driver: "Juan Martínez", driverTipo: "FIELD",
    departureTime: "06:45", estimatedArrival: "07:30", destination: "Zona A",
    passengers: [
      { name: "Andrés López", avatar: "AL", tipo: "FIELD" },
      { name: "Carlos Soto", avatar: "CS", tipo: "LOCAL" },
      { name: "Diego Vargas", avatar: "DV", tipo: "DESP" },
    ],
  },
  {
    id: "v2", plate: "3821-PLK", type: "Ford Transit", status: "En ruta",
    lat: 38.6900, lng: -4.1150, driver: "Pedro Ruiz", driverTipo: "DESP",
    departureTime: "07:10", estimatedArrival: "07:55", destination: "Zona B",
    passengers: [
      { name: "Miguel García", avatar: "MG", tipo: "LOCAL" },
      { name: "Ernesto Blanco", avatar: "EB", tipo: "FIELD" },
    ],
  },
  {
    id: "v3", plate: "5541-GHJ", type: "Seat Ateca", status: "Libre",
    lat: 38.6980, lng: -4.0980, driver: "Roberto Mora", driverTipo: "LOCAL",
    departureTime: "-", estimatedArrival: "-", destination: "-",
    passengers: [],
  },
  {
    id: "v4", plate: "9012-RNT", type: "Iveco Daily", status: "En obra",
    lat: 38.6930, lng: -4.1020, driver: "Fernando Torres", driverTipo: "FIELD",
    departureTime: "06:30", estimatedArrival: "07:15", destination: "Zona C",
    passengers: [
      { name: "Álvaro Sánchez", avatar: "AS", tipo: "DESP" },
      { name: "Tomás Herrera", avatar: "TH", tipo: "LOCAL" },
      { name: "Raúl Méndez", avatar: "RM", tipo: "FIELD" },
      { name: "Iván Delgado", avatar: "ID", tipo: "DESP" },
    ],
  },
  {
    id: "v5", plate: "7723-MNO", type: "Citroën Jumper", status: "En ruta",
    lat: 38.6870, lng: -4.1200, driver: "Sergio Navarro", driverTipo: "FIELD",
    departureTime: "07:20", estimatedArrival: "07:50", destination: "Zona D",
    passengers: [],
  },
];

const getDelayMinutes = (estimatedArrival: string): number => {
  if (estimatedArrival === "-") return 0;
  const [h, m] = estimatedArrival.split(":").map(Number);
  const now = new Date();
  const arrivalMinutes = h * 60 + m;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes > arrivalMinutes ? currentMinutes - arrivalMinutes : 0;
};

const TipoBadge = ({ tipo, small }: { tipo: WorkerTipo; small?: boolean }) => (
  <span
    className="inline-block rounded-full font-bold uppercase"
    style={{
      background: TIPO_COLORS[tipo],
      color: "#fff",
      fontSize: small ? 7 : 9,
      padding: small ? "1px 4px" : "2px 6px",
    }}
  >
    {TIPO_LABELS[tipo]}
  </span>
);

const createCircleIcon = (color: string, plate: string, driverTipo: WorkerTipo) => {
  const tipoColor = TIPO_COLORS[driverTipo];
  const tipoLabel = TIPO_LABELS[driverTipo];
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);cursor:pointer">
        <div style="position:relative">
          <div style="width:20px;height:20px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>
          <div style="position:absolute;top:-6px;right:-12px;background:${tipoColor};color:#fff;font-size:6px;font-weight:800;padding:1px 3px;border-radius:3px;line-height:1.2">${tipoLabel}</div>
        </div>
        <div style="margin-top:2px;background:#fff;border-radius:3px;padding:1px 4px;font-size:9px;font-weight:700;color:#333;box-shadow:0 1px 3px rgba(0,0,0,.2);white-space:nowrap">${plate}</div>
      </div>
    `,
    iconSize: [70, 40],
    iconAnchor: [35, 20],
  });
};

interface TrackingScreenProps {
  visible: boolean;
}

const TrackingScreen = ({ visible }: TrackingScreenProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [filter, setFilter] = useState<string>("Todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

    mockVehicles.forEach((v, i) => {
      const color = STATUS_COLORS[v.status];
      const marker = L.marker([v.lat, v.lng], { icon: createCircleIcon(color, v.plate, v.driverTipo) }).addTo(map);
      marker.on("click", () => setExpandedId(prev => prev === v.id ? null : v.id));
      markersRef.current.push(marker);
    });

    mapInstance.current = map;
  }, []);

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

  const DelayBadge = ({ v }: { v: Vehicle }) => {
    if (v.estimatedArrival === "-" || v.status === "Libre") return null;
    const delay = getDelayMinutes(v.estimatedArrival);
    if (delay > 0) {
      return <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: '#ef4444', color: '#fff' }}>ATRASADO +{delay}min</span>;
    }
    return <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: '#22c55e', color: '#fff' }}>A tiempo</span>;
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

      {/* Vehicle list with inline accordion */}
      <div className="glass-card rounded-[10px] overflow-hidden">
        {filtered.map((v) => {
          const isExpanded = expandedId === v.id;
          const delay = getDelayMinutes(v.estimatedArrival);
          return (
            <div key={v.id} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              {/* Row header */}
              <div
                className="flex items-center gap-3 px-3.5 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : v.id)}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[v.status] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-bold">{v.plate}</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: STATUS_COLORS[v.status], color: "#fff" }}>{v.status}</span>
                    <TipoBadge tipo={v.driverTipo} small />
                    <DelayBadge v={v} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{v.type} · {v.driver} · {v.passengers.length > 0 ? `${v.passengers.length + 1} pers.` : "Solo conductor"}</p>
                </div>
                <ChevronDown
                  size={16}
                  className="text-muted-foreground flex-shrink-0 transition-transform duration-200"
                  style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Conductor */}
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Conductor</div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border" style={{ background: 'hsl(var(--card))' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: TIPO_COLORS[v.driverTipo] }}>
                        {v.driver.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-[12px] font-bold flex-1">{v.driver}</span>
                      <TipoBadge tipo={v.driverTipo} small />
                    </div>
                  </div>

                  {/* Trip info */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="rounded-lg border border-border px-2 py-1.5 text-center" style={{ background: 'hsl(var(--card))' }}>
                      <div className="text-[9px] text-muted-foreground">Salida</div>
                      <div className="text-[13px] font-bold">{v.departureTime}</div>
                    </div>
                    <div className="rounded-lg border border-border px-2 py-1.5 text-center" style={{ background: 'hsl(var(--card))' }}>
                      <div className="text-[9px] text-muted-foreground">Llegada est.</div>
                      <div className="text-[13px] font-bold">{v.estimatedArrival}</div>
                    </div>
                    <div className="rounded-lg border border-border px-2 py-1.5 text-center" style={{ background: 'hsl(var(--card))' }}>
                      <div className="text-[9px] text-muted-foreground">Destino</div>
                      <div className="text-[13px] font-bold">{v.destination}</div>
                    </div>
                  </div>

                  {/* Passengers */}
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      Pasajeros {v.passengers.length > 0 ? `(${v.passengers.length})` : ""}
                    </div>
                    {v.passengers.length === 0 ? (
                      <div className="px-3 py-2 rounded-lg border border-border text-center text-[11px] text-muted-foreground" style={{ background: 'hsl(var(--card))' }}>
                        Solo conductor
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {v.passengers.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border" style={{ background: 'hsl(var(--card))' }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: TIPO_COLORS[p.tipo] }}>
                              {p.avatar}
                            </div>
                            <span className="text-[11px] font-medium flex-1">{p.name}</span>
                            <TipoBadge tipo={p.tipo} small />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingScreen;
