"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CompassIcon,
  LayersIcon,
  LocateFixedIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { RentalProperty } from "@/src/data/rentals-data";
import { formatPriceValue } from "@/lib/utils";

interface InteractiveMapProps {
  properties: RentalProperty[];
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;
  onSelectProperty: (property: RentalProperty) => void;
  onHoverProperty: (id: string | null) => void;
  className?: string;
}

type ClusterItem = {
  id: string;
  isCluster: true;
  count: number;
  x: number;
  y: number;
  properties: RentalProperty[];
};

type MarkerItem =
  | { isCluster: false; property: RentalProperty; x: number; y: number }
  | ClusterItem;

export function InteractiveMap({
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onSelectProperty,
  onHoverProperty,
  className = "",
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMovedMap, setHasMovedMap] = useState(false);
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [popupProperty, setPopupProperty] = useState<RentalProperty | null>(null);

  // Sync popup when property is selected from outside
  useEffect(() => {
    if (selectedPropertyId) {
      const match = properties.find((p) => p.id === selectedPropertyId);
      if (match) setPopupProperty(match);
    }
  }, [selectedPropertyId, properties]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on map canvas, not on markers or buttons
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest(".map-control")) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Cap panning bounds
    setPan({
      x: Math.max(-280 * zoom, Math.min(280 * zoom, newX)),
      y: Math.max(-220 * zoom, Math.min(220 * zoom, newY)),
    });
    setHasMovedMap(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(2.5, z + 0.35));
    setHasMovedMap(true);
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.75, z - 0.35));
    setHasMovedMap(true);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHasMovedMap(false);
  };

  // Clustering calculation based on current zoom
  const markers = useMemo(() => {
    if (zoom >= 1.4) {
      // Unpacked: all individual pins
      return properties.map((p) => ({
        isCluster: false as const,
        property: p,
        x: p.coords.x,
        y: p.coords.y,
      }));
    }

    // Cluster items within threshold
    const clusterThreshold = 12 / zoom;
    const processed = new Set<string>();
    const result: MarkerItem[] = [];

    properties.forEach((p1, idx) => {
      if (processed.has(p1.id)) return;
      const group = [p1];
      processed.add(p1.id);

      properties.slice(idx + 1).forEach((p2) => {
        if (processed.has(p2.id)) return;
        const dx = Math.abs(p1.coords.x - p2.coords.x);
        const dy = Math.abs(p1.coords.y - p2.coords.y);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < clusterThreshold) {
          group.push(p2);
          processed.add(p2.id);
        }
      });

      if (group.length > 1) {
        const avgX = group.reduce((acc, cur) => acc + cur.coords.x, 0) / group.length;
        const avgY = group.reduce((acc, cur) => acc + cur.coords.y, 0) / group.length;
        result.push({
          id: `cluster-${p1.id}`,
          isCluster: true,
          count: group.length,
          x: avgX,
          y: avgY,
          properties: group,
        });
      } else {
        result.push({
          isCluster: false,
          property: p1,
          x: p1.coords.x,
          y: p1.coords.y,
        });
      }
    });

    return result;
  }, [properties, zoom]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative h-full w-full overflow-hidden select-none bg-[#e8ecef] dark:bg-[#141824] cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* Floating "Search as I move the map" / "Search this area" Button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 map-control">
        {hasMovedMap && !searchAsMove ? (
          <button
            type="button"
            onClick={() => setHasMovedMap(false)}
            className="flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <SearchIcon className="size-3.5" />
            <span>Search this area</span>
          </button>
        ) : (
          <label className="flex h-9 items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md cursor-pointer hover:bg-card">
            <input
              type="checkbox"
              checked={searchAsMove}
              onChange={(e) => setSearchAsMove(e.target.checked)}
              className="size-3.5 rounded border-border text-primary focus:ring-primary/20"
            />
            <span>Search as I move the map</span>
          </label>
        )}
      </div>

      {/* Map Controls: Zoom in, Zoom out, Reset view */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5 map-control">
        <div className="flex flex-col rounded-lg border border-border/80 bg-card/90 shadow-sm backdrop-blur-md overflow-hidden">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={handleZoomIn}
            className="flex size-9 items-center justify-center text-foreground hover:bg-muted transition-colors border-b border-border/60"
          >
            <PlusIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={handleZoomOut}
            className="flex size-9 items-center justify-center text-foreground hover:bg-muted transition-colors"
          >
            <MinusIcon className="size-4" />
          </button>
        </div>

        <button
          type="button"
          aria-label="Reset Map View"
          title="Reset Map View"
          onClick={handleResetView}
          className="flex size-9 items-center justify-center rounded-lg border border-border/80 bg-card/90 text-foreground shadow-sm backdrop-blur-md hover:bg-muted transition-colors"
        >
          <RotateCcwIcon className="size-3.5" />
        </button>
      </div>

      {/* Map Viewport / Scaled Canvas Layer */}
      <div
        className="absolute inset-0 h-full w-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {/* SVG Stylized Vector Basemap (Water, Parks, Roads, Districts) */}
        <svg
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full pointer-events-none"
        >
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="waterGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#172554" stopOpacity="0.5" />
            </linearGradient>
            <pattern id="streetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/40"
              />
            </pattern>
          </defs>

          {/* Background Grid Texture */}
          <rect width="1000" height="800" fill="url(#streetGrid)" />

          {/* Park / Greenery Polygons */}
          <path
            d="M 640 220 C 720 200, 780 260, 750 350 C 710 390, 630 360, 640 220 Z"
            className="fill-emerald-500/15 dark:fill-emerald-900/20"
          />
          <path
            d="M 180 390 C 230 370, 270 420, 240 480 C 200 500, 160 450, 180 390 Z"
            className="fill-emerald-500/15 dark:fill-emerald-900/20"
          />
          <path
            d="M 500 580 C 570 560, 610 630, 560 690 C 510 700, 480 640, 500 580 Z"
            className="fill-emerald-500/15 dark:fill-emerald-900/20"
          />

          {/* Oder River / Waterway */}
          <path
            d="M -50 320 Q 220 280, 360 250 T 520 230 T 700 280 T 1050 380 L 1050 430 Q 720 330, 530 280 T 360 300 T -50 370 Z"
            className="fill-blue-400/30 dark:fill-blue-900/40 stroke-blue-400/40 dark:stroke-blue-800/40 stroke-[1.5]"
          />
          {/* Secondary River Branch / Canal around island */}
          <path
            d="M 330 270 Q 420 320, 490 280 L 485 260 Q 420 295, 340 255 Z"
            className="fill-blue-400/30 dark:fill-blue-900/40"
          />

          {/* Major Arterial Roads & Bridges */}
          <path
            d="M 500 -50 L 500 850"
            className="stroke-background dark:stroke-muted stroke-[7]"
          />
          <path
            d="M 500 -50 L 500 850"
            className="stroke-amber-400/40 dark:stroke-amber-500/20 stroke-[3]"
          />
          <path
            d="M -50 420 L 1050 420"
            className="stroke-background dark:stroke-muted stroke-[7]"
          />
          <path
            d="M -50 420 L 1050 420"
            className="stroke-amber-400/40 dark:stroke-amber-500/20 stroke-[3]"
          />
          <path
            d="M 120 750 L 880 120"
            className="stroke-background dark:stroke-muted stroke-[5]"
          />
          <path
            d="M 120 750 L 880 120"
            className="stroke-slate-300 dark:stroke-slate-700 stroke-[2]"
          />

          {/* Bridges crossing river */}
          <rect
            x="365"
            y="260"
            width="12"
            height="32"
            rx="2"
            className="fill-foreground/70"
          />
          <rect
            x="485"
            y="245"
            width="12"
            height="32"
            rx="2"
            className="fill-foreground/70"
          />

          {/* District Outline Labels */}
          <text
            x="390"
            y="370"
            className="fill-foreground/40 text-[13px] font-bold tracking-widest uppercase font-mono"
          >
            Stare Miasto
          </text>
          <text
            x="560"
            y="190"
            className="fill-foreground/40 text-[13px] font-bold tracking-widest uppercase font-mono"
          >
            Śródmieście
          </text>
          <text
            x="680"
            y="310"
            className="fill-foreground/35 text-[12px] font-semibold tracking-wider uppercase font-mono"
          >
            Biskupin
          </text>
          <text
            x="170"
            y="430"
            className="fill-foreground/35 text-[12px] font-semibold tracking-wider uppercase font-mono"
          >
            Fabryczna
          </text>
          <text
            x="500"
            y="650"
            className="fill-foreground/35 text-[12px] font-semibold tracking-wider uppercase font-mono"
          >
            Krzyki
          </text>
          <text
            x="400"
            y="210"
            className="fill-foreground/35 text-[11px] font-semibold tracking-wider uppercase font-mono"
          >
            Nadodrze
          </text>
        </svg>

        {/* Dynamic Pins & Clusters Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {markers.map((marker) => {
            if (marker.isCluster) {
              return (
                <div
                  key={marker.id}
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Zoom in on cluster
                      setZoom((z) => Math.min(2.5, z + 0.6));
                      setPan({
                        x: -(marker.x - 50) * 8 * zoom,
                        y: -(marker.y - 50) * 6 * zoom,
                      });
                    }}
                    className="group relative flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-lg transition-transform hover:scale-110 active:scale-95 ring-4 ring-primary/20"
                  >
                    <span className="relative z-10">{marker.count}</span>
                    <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-30" />
                  </button>
                </div>
              );
            }

            const { property } = marker;
            const isSelected = selectedPropertyId === property.id;
            const isHovered = hoveredPropertyId === property.id;

            return (
              <div
                key={property.id}
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-full pointer-events-auto transition-all duration-200 ${
                  isHovered || isSelected ? "z-30 scale-110 -translate-y-[115%]" : "z-10 hover:z-20"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupProperty(property);
                    onSelectProperty(property);
                  }}
                  onMouseEnter={() => onHoverProperty(property.id)}
                  onMouseLeave={() => onHoverProperty(null)}
                  className={`group relative flex items-center rounded-full px-2.5 py-1 text-xs font-bold transition-all shadow-md ${
                    isSelected || isHovered
                      ? "bg-primary text-primary-foreground shadow-lg ring-3 ring-primary/30 animate-bounce"
                      : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground border border-border/80"
                  }`}
                >
                  <span>{formatPriceValue(property.price)}</span>
                  {/* Pin Pointer Stem Tail */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-solid border-t-4 border-x-4 border-b-0 border-x-transparent ${
                      isSelected || isHovered
                        ? "border-t-primary"
                        : "border-t-card group-hover:border-t-primary"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Floating Mini Popup Card on Pin Click */}
        {popupProperty && (
          <div
            style={{
              left: `${popupProperty.coords.x}%`,
              top: `${popupProperty.coords.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-[135%] z-40 w-64 rounded-xl border border-border bg-card p-2.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 w-full overflow-hidden rounded-lg bg-muted mb-2">
              <Image
                src={popupProperty.image}
                alt={popupProperty.title}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setPopupProperty(null)}
                className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                <XIcon className="size-3.5" />
              </button>
              <div className="absolute bottom-1.5 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                {popupProperty.propertyType}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-foreground truncate">
                {popupProperty.title}
              </h4>
              <p className="text-[11px] text-muted-foreground truncate">
                {popupProperty.address}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold text-foreground">
                  {formatPriceValue(popupProperty.price)}
                  <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                </span>
                <button
                  type="button"
                  onClick={() => onSelectProperty(popupProperty)}
                  className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  View Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styled Map Attribution at bottom-right corner */}
      <div className="absolute bottom-2 right-2 z-20 rounded-md bg-card/80 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur-xs border border-border/50">
        <span>© OpenStreetMap contributors • Carto Vector</span>
      </div>
    </div>
  );
}

