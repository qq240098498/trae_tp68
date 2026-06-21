import type { LocationPoint } from '@/types';

const BEIJING_LNG = 116.4074;
const BEIJING_LAT = 39.9042;
const RANGE = 0.1;

export function generateRandomPoint(): LocationPoint {
  const lng = BEIJING_LNG + (Math.random() - 0.5) * RANGE * 2;
  const lat = BEIJING_LAT + (Math.random() - 0.5) * RANGE * 2;
  return { lng, lat };
}

export function calculateDistance(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function interpolatePosition(
  start: LocationPoint,
  end: LocationPoint,
  progress: number,
): LocationPoint {
  const p = Math.max(0, Math.min(1, progress));
  return {
    lng: start.lng + (end.lng - start.lng) * p,
    lat: start.lat + (end.lat - start.lat) * p,
  };
}

export function estimateETA(distance: number, speed: number = 40): number {
  return (distance / speed) * 60;
}
