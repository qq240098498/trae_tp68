import type { Order, BackhaulMatchResult, VehicleType } from '@/types';
import { calculateDistance } from '@/utils/map';
import { VEHICLE_PRICING } from './fareService';

const MAX_DETOUR_RATIO = 0.8;
const MAX_SEARCH_RADIUS_KM = 30;
const SAVINGS_DISCOUNT_RATE = 0.2;

const locationMap: Record<string, { lng: number; lat: number }> = {
  '北京市朝阳区望京西园三区': { lng: 116.476, lat: 40.003 },
  '北京市昌平区回龙观东大街': { lng: 116.337, lat: 40.076 },
  '北京市朝阳区建国路88号': { lng: 116.462, lat: 39.908 },
  '北京市海淀区中关村大街1号': { lng: 116.318, lat: 39.983 },
  '北京市西城区西单北大街120号': { lng: 116.374, lat: 39.913 },
  '北京市东城区王府井大街138号': { lng: 116.410, lat: 39.915 },
  '北京市朝阳区望京SOHO': { lng: 116.470, lat: 39.997 },
  '北京市通州区新华大街256号': { lng: 116.657, lat: 39.909 },
  '北京市丰台区南三环西路16号': { lng: 116.360, lat: 39.858 },
  '北京市石景山区石景山路22号': { lng: 116.226, lat: 39.907 },
  '北京市海淀区学院路15号': { lng: 116.351, lat: 39.987 },
  '北京市昌平区回龙观西大街8号': { lng: 116.330, lat: 40.067 },
  '北京市朝阳区三里屯太古里': { lng: 116.454, lat: 39.937 },
  '北京市朝阳区国贸中心': { lng: 116.461, lat: 39.909 },
  '北京市大兴区亦庄经济开发区': { lng: 116.508, lat: 39.786 },
  '北京市顺义区天竺空港工业区': { lng: 116.586, lat: 40.080 },
  '北京市东城区东长安街1号': { lng: 116.406, lat: 39.909 },
  '北京市西城区金融街7号': { lng: 116.360, lat: 39.915 },
  '北京市丰台区大红门': { lng: 116.392, lat: 39.833 },
  '北京市朝阳区国贸商城': { lng: 116.460, lat: 39.908 },
  '北京市顺义区中国国际展览中心': { lng: 116.507, lat: 40.132 },
  '北京市朝阳区国家会议中心': { lng: 116.394, lat: 39.997 },
  '北京市西城区北京西站': { lng: 116.321, lat: 39.894 },
  '北京市朝阳区北京南站': { lng: 116.378, lat: 39.865 },
  '北京市海淀区五道口': { lng: 116.337, lat: 39.992 },
  '北京市朝阳区双井': { lng: 116.465, lat: 39.892 },
  '北京市丰台区丽泽商务区': { lng: 116.335, lat: 39.856 },
  '北京市朝阳区酒仙桥': { lng: 116.493, lat: 39.982 },
  '北京市海淀区西二旗': { lng: 116.297, lat: 40.050 },
  '北京市通州区九棵树': { lng: 116.658, lat: 39.890 },
  '北京市朝阳区望京科技园': { lng: 116.478, lat: 40.005 },
  '北京市海淀区中关村软件园': { lng: 116.320, lat: 40.035 },
  '北京市东城区东直门外大街48号': { lng: 116.425, lat: 39.940 },
  '北京市丰台区大红门服装城': { lng: 116.395, lat: 39.830 },
  '北京市房山区良乡西路10号': { lng: 116.150, lat: 39.730 },
  '北京市大兴区黄村东大街1号': { lng: 116.330, lat: 39.720 },
};

const getLocation = (address: string): { lng: number; lat: number } => {
  if (locationMap[address]) {
    return locationMap[address];
  }
  const baseLng = 116.4 + (Math.random() - 0.5) * 0.4;
  const baseLat = 39.9 + (Math.random() - 0.5) * 0.3;
  locationMap[address] = { lng: baseLng, lat: baseLat };
  return locationMap[address];
};

const calculateMatchScore = (
  completedOrder: Order,
  candidateOrder: Order,
  originDistance: number,
  destDistance: number,
  detourDistance: number
): number => {
  let score = 100;

  const detourPenalty = (detourDistance / completedOrder.distance) * 30;
  score -= detourPenalty;

  const originPenalty = (originDistance / MAX_SEARCH_RADIUS_KM) * 25;
  score -= originPenalty;

  const destPenalty = (destDistance / MAX_SEARCH_RADIUS_KM) * 15;
  score -= destPenalty;

  if (completedOrder.vehicleType === candidateOrder.vehicleType) {
    score += 10;
  }

  const completedTime = new Date(completedOrder.appointmentTime).getTime();
  const candidateTime = new Date(candidateOrder.appointmentTime).getTime();
  const timeDiffHours = Math.abs(candidateTime - completedTime) / (1000 * 60 * 60);
  if (timeDiffHours <= 2) {
    score += 15;
  } else if (timeDiffHours <= 4) {
    score += 10;
  } else if (timeDiffHours <= 8) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
};

export const searchBackhaulOrders = (
  completedOrder: Order,
  allOrders: Order[],
  options?: {
    maxDetourRatio?: number;
    maxSearchRadius?: number;
  }
): BackhaulMatchResult[] => {
  const maxDetourRatio = options?.maxDetourRatio ?? MAX_DETOUR_RATIO;
  const maxSearchRadius = options?.maxSearchRadius ?? MAX_SEARCH_RADIUS_KM;

  const completedDest = getLocation(completedOrder.destination);
  const completedOrigin = getLocation(completedOrder.origin);

  const results: BackhaulMatchResult[] = [];

  for (const candidate of allOrders) {
    if (candidate.id === completedOrder.id) continue;
    if (candidate.status !== 'pending') continue;
    if (candidate.driverId) continue;

    if (candidate.weight > completedOrder.weight * 1.2) continue;
    if (candidate.volume > completedOrder.volume * 1.2) continue;

    const candidateOrigin = getLocation(candidate.origin);
    const candidateDest = getLocation(candidate.destination);

    const originDistance = calculateDistance(completedDest, candidateOrigin);
    const destDistance = calculateDistance(completedOrigin, candidateDest);

    if (originDistance > maxSearchRadius) continue;

    const totalDistance = originDistance + candidate.distance + destDistance;
    const originalDistance = completedOrder.distance;
    const detourDistance = totalDistance - originalDistance;
    const detourRatio = detourDistance / originalDistance;

    if (detourRatio > maxDetourRatio) continue;

    const matchScore = calculateMatchScore(
      completedOrder,
      candidate,
      originDistance,
      destDistance,
      detourDistance
    );

    const pricing = VEHICLE_PRICING[completedOrder.vehicleType as VehicleType];
    const originalFare = completedOrder.totalFare;
    const backhaulFare = candidate.totalFare;
    const savings = backhaulFare * SAVINGS_DISCOUNT_RATE + originalFare * 0.1;

    const completedTime = new Date(completedOrder.appointmentTime).getTime();
    const candidateTime = new Date(candidate.appointmentTime).getTime();
    const timeDiffHours = Math.abs(candidateTime - completedTime) / (1000 * 60 * 60);

    results.push({
      order: candidate,
      matchScore: Math.round(matchScore * 10) / 10,
      detourDistance: Math.round(detourDistance * 10) / 10,
      originDistance: Math.round(originDistance * 10) / 10,
      destinationDistance: Math.round(destDistance * 10) / 10,
      estimatedSavings: Math.round(savings * 100) / 100,
      timeMatch: Math.round(timeDiffHours * 10) / 10,
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
};

export const getBackhaulRecommendationsForDriver = (
  driverId: string,
  allOrders: Order[]
): BackhaulMatchResult[] => {
  const driverCompletedOrders = allOrders.filter(
    (o) => o.driverId === driverId && o.status === 'completed'
  );

  if (driverCompletedOrders.length === 0) return [];

  const recentCompleted = driverCompletedOrders.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  const pendingOrders = allOrders.filter((o) => o.status === 'pending' && !o.driverId);

  return searchBackhaulOrders(recentCompleted, pendingOrders);
};

export const formatMatchScore = (score: number): { level: string; color: string } => {
  if (score >= 80) return { level: '非常顺路', color: 'text-green-600' };
  if (score >= 60) return { level: '比较顺路', color: 'text-blue-600' };
  if (score >= 40) return { level: '一般', color: 'text-yellow-600' };
  return { level: '绕路较多', color: 'text-orange-600' };
};
