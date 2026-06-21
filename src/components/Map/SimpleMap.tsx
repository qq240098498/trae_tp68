import { MapPin, Navigation } from 'lucide-react';
import type { LocationPoint } from '@/types';
import { useMemo, useCallback } from 'react';

interface SimpleMapProps {
  origin?: LocationPoint;
  destination?: LocationPoint;
  driverPosition?: LocationPoint;
  routePoints?: LocationPoint[];
}

export default function SimpleMap({
  origin,
  destination,
  driverPosition,
  routePoints = [],
}: SimpleMapProps) {
  const width = 800;
  const height = 500;
  const padding = 60;

  const allPoints = useMemo(() => {
    const points: LocationPoint[] = [];
    if (origin) points.push(origin);
    if (destination) points.push(destination);
    if (driverPosition) points.push(driverPosition);
    if (routePoints.length > 0) points.push(...routePoints);
    return points;
  }, [origin, destination, driverPosition, routePoints]);

  const bounds = useMemo(() => {
    if (allPoints.length === 0) {
      return { minLng: 0, maxLng: 100, minLat: 0, maxLat: 100 };
    }
    const lngs = allPoints.map((p) => p.lng);
    const lats = allPoints.map((p) => p.lat);
    return {
      minLng: Math.min(...lngs) - 0.01,
      maxLng: Math.max(...lngs) + 0.01,
      minLat: Math.min(...lats) - 0.01,
      maxLat: Math.max(...lats) + 0.01,
    };
  }, [allPoints]);

  const pointToSvg = useCallback(
    (point: LocationPoint): { x: number; y: number } => {
      const lngRange = bounds.maxLng - bounds.minLng || 1;
      const latRange = bounds.maxLat - bounds.minLat || 1;
      const x = padding + ((point.lng - bounds.minLng) / lngRange) * (width - padding * 2);
      const y = height - padding - ((point.lat - bounds.minLat) / latRange) * (height - padding * 2);
      return { x, y };
    },
    [bounds]
  );

  const routePath = useMemo(() => {
    if (routePoints.length < 2) return '';
    const svgPoints = routePoints.map(pointToSvg);
    return svgPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  }, [routePoints, pointToSvg]);

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 8; i++) {
      const x = padding + (i / 8) * (width - padding * 2);
      lines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={height - padding}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    }
    for (let i = 0; i <= 6; i++) {
      const y = padding + (i / 6) * (height - padding * 2);
      lines.push(
        <line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    }
    return lines;
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <rect x="0" y="0" width={width} height={height} fill="#F9FAFB" />
        {gridLines}

        <rect
          x={padding}
          y={padding}
          width={width - padding * 2}
          height={height - padding * 2}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="2"
          rx="4"
        />

        {routePath && (
          <path
            d={routePath}
            fill="none"
            stroke="#165DFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 4"
          />
        )}

        {origin && (
          <g transform={`translate(${pointToSvg(origin).x}, ${pointToSvg(origin).y})`}>
            <circle r="14" fill="#10B981" opacity="0.2" />
            <circle r="8" fill="#10B981" />
            <text y="-20" textAnchor="middle" className="text-xs fill-gray-700 font-medium">
              起点
            </text>
          </g>
        )}

        {destination && (
          <g transform={`translate(${pointToSvg(destination).x}, ${pointToSvg(destination).y})`}>
            <circle r="14" fill="#EF4444" opacity="0.2" />
            <MapPin className="w-6 h-6 text-red-500" transform="translate(-12, -24)" />
            <text y="-28" textAnchor="middle" className="text-xs fill-gray-700 font-medium">
              终点
            </text>
          </g>
        )}

        {driverPosition && (
          <g transform={`translate(${pointToSvg(driverPosition).x}, ${pointToSvg(driverPosition).y})`}>
            <circle r="16" fill="#165DFF" opacity="0.2">
              <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="10" fill="#165DFF" stroke="white" strokeWidth="2" />
            <Navigation className="w-4 h-4 text-white" transform="translate(-8, -8)" />
          </g>
        )}

        {allPoints.length === 0 && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            className="text-sm fill-gray-400"
          >
            暂无位置数据
          </text>
        )}
      </svg>
    </div>
  );
}
