import { useState, useMemo } from 'react';
import {
  Truck,
  Car,
  Route,
  Building2,
  Package,
  Plus,
  Minus,
  Info,
  DollarSign,
} from 'lucide-react';
import type { VehicleType, FareDetail } from '@/types';
import { VEHICLE_PRICING, calculateFare } from '@/services/fareService';
import { formatMoney } from '@/utils/format';
import { cn } from '@/lib/utils';

const vehicleIcons: Record<VehicleType, typeof Car> = {
  van: Car,
  small_truck: Truck,
  medium_truck: Truck,
  large_truck: Truck,
};

export default function Calculator() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('van');
  const [distance, setDistance] = useState<number>(10);
  const [originFloor, setOriginFloor] = useState<number>(1);
  const [originHasElevator, setOriginHasElevator] = useState<boolean>(true);
  const [destFloor, setDestFloor] = useState<number>(1);
  const [destHasElevator, setDestHasElevator] = useState<boolean>(true);
  const [needHandling, setNeedHandling] = useState<boolean>(false);
  const [largeItemCount, setLargeItemCount] = useState<number>(0);

  const fareDetail: FareDetail = useMemo(() => {
    return calculateFare({
      vehicleType: selectedVehicle,
      distance,
      originFloor,
      originHasElevator,
      destFloor,
      destHasElevator,
      needHandling,
      largeItemCount,
    });
  }, [selectedVehicle, distance, originFloor, originHasElevator, destFloor, destHasElevator, needHandling, largeItemCount]);

  const pricing = VEHICLE_PRICING[selectedVehicle];
  const VehicleIcon = vehicleIcons[selectedVehicle];

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDistance(isNaN(value) ? 0 : Math.max(0, value));
  };

  const handleOriginFloorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setOriginFloor(isNaN(value) ? 1 : Math.max(1, Math.min(30, value)));
  };

  const handleDestFloorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setDestFloor(isNaN(value) ? 1 : Math.max(1, Math.min(30, value)));
  };

  const incrementLargeItems = () => {
    setLargeItemCount((prev) => Math.min(prev + 1, 20));
  };

  const decrementLargeItems = () => {
    setLargeItemCount((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">运费计算器</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-800">选择车型</h3>
            <div className="grid grid-cols-4 gap-4">
              {(Object.keys(VEHICLE_PRICING) as VehicleType[]).map((type) => {
                const vehicle = VEHICLE_PRICING[type];
                const Icon = vehicleIcons[type];
                const isSelected = selectedVehicle === type;

                return (
                  <div
                    key={type}
                    onClick={() => setSelectedVehicle(type)}
                    className={cn(
                      'cursor-pointer rounded-lg border-2 p-4 transition-all',
                      isSelected
                        ? 'border-[#165DFF] bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg',
                        isSelected ? 'bg-[#165DFF] text-white' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4
                      className={cn(
                        'text-center text-sm font-medium',
                        isSelected ? 'text-[#165DFF]' : 'text-gray-800'
                      )}
                    >
                      {vehicle.name}
                    </h4>
                    <p className="mt-1 text-center text-xs text-gray-500">
                      起步价 {formatMoney(vehicle.baseFare)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="font-medium">车型参数</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">载重：</span>
                  <span className="font-medium text-gray-700">{pricing.loadCapacity}吨</span>
                </div>
                <div>
                  <span className="text-gray-500">容积：</span>
                  <span className="font-medium text-gray-700">{pricing.volumeCapacity}方</span>
                </div>
                <div>
                  <span className="text-gray-500">起步里程：</span>
                  <span className="font-medium text-gray-700">{pricing.baseMileage}公里</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-800">运输信息</h3>
            <div className="space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Route className="h-4 w-4 text-blue-500" />
                  行驶里程 (公里)
                </label>
                <input
                  type="number"
                  value={distance}
                  onChange={handleDistanceChange}
                  min="0"
                  step="0.1"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building2 className="h-4 w-4 text-green-500" />
                    起点楼层
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={originFloor}
                      onChange={handleOriginFloorChange}
                      min="1"
                      max="30"
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20"
                    />
                    <button
                      onClick={() => setOriginHasElevator(!originHasElevator)}
                      className={cn(
                        'w-20 rounded-lg border text-sm font-medium transition-colors',
                        originHasElevator
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                      )}
                    >
                      {originHasElevator ? '有电梯' : '无电梯'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building2 className="h-4 w-4 text-red-500" />
                    终点楼层
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={destFloor}
                      onChange={handleDestFloorChange}
                      min="1"
                      max="30"
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20"
                    />
                    <button
                      onClick={() => setDestHasElevator(!destHasElevator)}
                      className={cn(
                        'w-20 rounded-lg border text-sm font-medium transition-colors',
                        destHasElevator
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                      )}
                    >
                      {destHasElevator ? '有电梯' : '无电梯'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">需要搬运服务</p>
                    <p className="text-xs text-gray-500">
                      有电梯 {formatMoney(pricing.floorPriceElevator)}/层，无电梯 2-4层 {formatMoney(pricing.floorPriceNoElevatorLow)}/层，5-6层 {formatMoney(pricing.floorPriceNoElevatorMid)}/层，7层以上 {formatMoney(pricing.floorPriceNoElevatorHigh)}/层
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNeedHandling(!needHandling)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    needHandling ? 'bg-[#165DFF]' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      needHandling ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  ></span>
                </button>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Package className="h-4 w-4 text-purple-500" />
                  大件数量
                  <span className="text-xs font-normal text-gray-500">
                    ({formatMoney(pricing.largeItemPrice)}/件)
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementLargeItems}
                    disabled={largeItemCount <= 0}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
                      largeItemCount <= 0
                        ? 'cursor-not-allowed border-gray-200 text-gray-300'
                        : 'border-gray-300 text-gray-600 hover:border-[#165DFF] hover:text-[#165DFF]'
                    )}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-16 text-center text-lg font-semibold text-gray-800">
                    {largeItemCount}
                  </span>
                  <button
                    onClick={incrementLargeItems}
                    disabled={largeItemCount >= 20}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
                      largeItemCount >= 20
                        ? 'cursor-not-allowed border-gray-200 text-gray-300'
                        : 'border-gray-300 text-gray-600 hover:border-[#165DFF] hover:text-[#165DFF]'
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-gray-500">件 (最多20件)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-6 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <DollarSign className="h-5 w-5 text-[#165DFF]" />
              <h3 className="text-base font-semibold text-gray-800">费用明细</h3>
            </div>

            <div className="py-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">起步价</span>
                  <span className="font-medium text-gray-800">
                    {formatMoney(fareDetail.baseFare)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    里程费
                    {distance > pricing.baseMileage && (
                      <span className="text-xs text-gray-400">
                        ({(distance - pricing.baseMileage).toFixed(1)}公里 ×{' '}
                        {formatMoney(pricing.mileagePrice)}/公里)
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatMoney(fareDetail.mileageFare)}
                  </span>
                </div>
                {needHandling && fareDetail.floorFareDetail && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        楼层搬运费
                        <span className="text-xs text-gray-400">
                          (起点{fareDetail.floorFareDetail.originHasElevator ? '有电梯' : '无电梯'} × {fareDetail.floorFareDetail.origin}层 + 
                           终点{fareDetail.floorFareDetail.destHasElevator ? '有电梯' : '无电梯'} × {fareDetail.floorFareDetail.dest}层)
                        </span>
                      </span>
                      <span className="font-medium text-gray-800">
                        {formatMoney(fareDetail.floorFare)}
                      </span>
                    </div>
                    {fareDetail.floorFareDetail.origin > 0 && (
                      <div className="flex justify-between text-xs text-gray-400 pl-2">
                        <span>起点: {fareDetail.floorFareDetail.origin}层 × {formatMoney(fareDetail.floorFareDetail.originPricePerFloor)}/层</span>
                        <span>{formatMoney(fareDetail.floorFareDetail.origin * fareDetail.floorFareDetail.originPricePerFloor)}</span>
                      </div>
                    )}
                    {fareDetail.floorFareDetail.dest > 0 && (
                      <div className="flex justify-between text-xs text-gray-400 pl-2">
                        <span>终点: {fareDetail.floorFareDetail.dest}层 × {formatMoney(fareDetail.floorFareDetail.destPricePerFloor)}/层</span>
                        <span>{formatMoney(fareDetail.floorFareDetail.dest * fareDetail.floorFareDetail.destPricePerFloor)}</span>
                      </div>
                    )}
                  </div>
                )}
                {largeItemCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      大件附加费
                      <span className="text-xs text-gray-400">
                        ({largeItemCount}件 × {formatMoney(pricing.largeItemPrice)}/件)
                      </span>
                    </span>
                    <span className="font-medium text-gray-800">
                      {formatMoney(fareDetail.largeItemFare)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-800">预估总费用</span>
                  <span className="text-2xl font-bold text-[#165DFF]">
                    {formatMoney(fareDetail.totalFare)}
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full rounded-lg bg-[#165DFF] py-3 text-sm font-medium text-white transition-colors hover:bg-[#0D47CC]">
              立即下单
            </button>

            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">温馨提示</p>
                  <p className="mt-1">
                    以上为预估费用，实际费用可能因路况、等待时间等因素有所调整。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
