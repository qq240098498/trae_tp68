import type { LocationPoint } from '@/types';

const EARTH_RADIUS = 6371;

export const toRad = (deg: number): number => {
  return (deg * Math.PI) / 180;
};

export const toDeg = (rad: number): number => {
  return (rad * 180) / Math.PI;
};

export const calculateDistance = (point1: LocationPoint, point2: LocationPoint): number => {
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
};

export const getMidpoint = (point1: LocationPoint, point2: LocationPoint): LocationPoint => {
  return {
    lng: (point1.lng + point2.lng) / 2,
    lat: (point1.lat + point2.lat) / 2,
  };
};

export const calculateBearing = (start: LocationPoint, end: LocationPoint): number => {
  const startLat = toRad(start.lat);
  const endLat = toRad(end.lat);
  const dLng = toRad(end.lng - start.lng);

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  let bearing = toDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return bearing;
};

export const estimateDuration = (distanceKm: number, speedKmh: number = 40): number => {
  return Math.round((distanceKm / speedKmh) * 60);
};
