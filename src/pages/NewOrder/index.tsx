import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ArrowUpDown,
  Package,
  Scale,
  Box,
  Truck,
  Sparkles,
  Clock,
  ChevronUp,
  ChevronDown,
  Calculator,
  X,
  Check,
  Plus,
  Minus,
  Home,
  ShoppingBag,
  Utensils,
  Wine,
  AlertTriangle,
  Grip,
} from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useOrderStore } from '@/store/useOrderStore';
import { matchVehicle } from '@/services/vehicleService';
import { calculateFare, VEHICLE_PRICING, LARGE_ITEMS } from '@/services/fareService';
import { formatMoney } from '@/utils/format';
import type { VehicleType, NewOrderForm, FareDetail, SelectedLargeItem, CargoScenario } from '@/types';
import { cn } from '@/lib/utils';

const scenarioOptions: { value: CargoScenario; label: string; icon: typeof Home }[] = [
  { value: '普通货物', label: '普通货物', icon: Package },
  { value: '家具家电', label: '家具家电', icon: ShoppingBag },
  { value: '建材', label: '建材', icon: Grip },
  { value: '食品', label: '食品', icon: Utensils },
  { value: '易碎品', label: '易碎品', icon: AlertTriangle },
  { value: '搬家', label: '搬家', icon: Home },
  { value: '其他', label: '其他', icon: Wine },
];

const vehicleTypes: VehicleType[] = ['van', 'small_truck', 'medium_truck', 'large_truck'];

const getItemIcon = (iconName: string) => {
  const iconMap: Record<string, typeof Home> = {
    Fridge: Home,
    WashingMachine: Package,
    Sofa: Home,
    Bed: Package,
    Piano: ShoppingBag,
    BedDouble: Home,
    Wardrobe: Package,
    Tv: ShoppingBag,
    AirVent: AlertTriangle,
    Table: Grip,
    Laptop: ShoppingBag,
    Armchair: Home,
  };
  return iconMap[iconName] || Package;
};

export default function NewOrder() {
  const navigate = useNavigate();
  const createOrder = useOrderStore((state) => state.createOrder);

  const [formData, setFormData] = useState<NewOrderForm>({
    origin: '',
    originFloor: 1,
    originHasElevator: true,
    destination: '',
    destFloor: 1,
    destHasElevator: true,
    cargoType: '普通货物',
    cargoScenario: '普通货物',
    weight: 0,
    volume: 0,
    vehicleType: null,
    appointmentTime: null,
    needHandling: false,
    largeItemCount: 0,
    largeItems: [],
    distance: 10,
  });

  const [recommendedVehicle, setRecommendedVehicle] = useState<VehicleType | null>(null);
  const [fareDetail, setFareDetail] = useState<FareDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLargeItemModal, setShowLargeItemModal] = useState(false);
  const [selectedLargeItems, setSelectedLargeItems] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (formData.weight > 0 || formData.volume > 0) {
      const matched = matchVehicle(formData.weight, formData.volume);
      setRecommendedVehicle(matched);
      if (!formData.vehicleType) {
        setFormData((prev) => ({ ...prev, vehicleType: matched }));
      }
    }
  }, [formData.weight, formData.volume]);

  useEffect(() => {
    if (formData.vehicleType) {
      const fare = calculateFare({
        vehicleType: formData.vehicleType,
        distance: formData.distance,
        originFloor: formData.originFloor,
        originHasElevator: formData.originHasElevator,
        destFloor: formData.destFloor,
        destHasElevator: formData.destHasElevator,
        needHandling: formData.needHandling,
        largeItemCount: formData.largeItemCount,
        largeItems: formData.largeItems,
      });
      setFareDetail(fare);
    }
  }, [
    formData.vehicleType,
    formData.distance,
    formData.originFloor,
    formData.originHasElevator,
    formData.destFloor,
    formData.destHasElevator,
    formData.needHandling,
    formData.largeItemCount,
    formData.largeItems,
  ]);

  const handleSwapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
      originFloor: prev.destFloor,
      destFloor: prev.originFloor,
      originHasElevator: prev.destHasElevator,
      destHasElevator: prev.originHasElevator,
    }));
  };

  const handleAutoMatch = () => {
    if (recommendedVehicle) {
      setFormData((prev) => ({ ...prev, vehicleType: recommendedVehicle }));
    }
  };

  const handleScenarioChange = (scenario: CargoScenario) => {
    setFormData((prev) => ({
      ...prev,
      cargoType: scenario,
      cargoScenario: scenario,
    }));

    if (scenario === '搬家') {
      setShowLargeItemModal(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        largeItems: [],
        largeItemCount: 0,
      }));
      setSelectedLargeItems(new Map());
    }
  };

  const handleItemQuantityChange = (itemId: string, delta: number) => {
    setSelectedLargeItems((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(itemId) || 0;
      const newQuantity = Math.max(0, current + delta);
      if (newQuantity === 0) {
        newMap.delete(itemId);
      } else {
        newMap.set(itemId, newQuantity);
      }
      return newMap;
    });
  };

  const handleConfirmLargeItems = () => {
    const selectedItems: SelectedLargeItem[] = [];
    let totalCount = 0;
    let totalWeight = 0;
    let totalVolume = 0;

    selectedLargeItems.forEach((quantity, itemId) => {
      const item = LARGE_ITEMS.find((i) => i.id === itemId);
      if (item) {
        selectedItems.push({ item, quantity });
        totalCount += quantity;
        totalWeight += (item.weight || 0) * quantity;
        totalVolume += (item.volume || 0) * quantity;
      }
    });

    setFormData((prev) => ({
      ...prev,
      largeItems: selectedItems,
      largeItemCount: totalCount,
      weight: totalWeight,
      volume: totalVolume,
    }));

    setShowLargeItemModal(false);
  };

  const handleSubmit = async () => {
    if (!formData.vehicleType || !fareDetail) return;

    setSubmitting(true);
    try {
      await createOrder({
        ...formData,
        vehicleType: formData.vehicleType,
        appointmentTime: formData.appointmentTime || new Date(),
        totalFare: fareDetail.totalFare,
        fareDetail,
      });
      navigate('/orders');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">创建订单</h1>
        <p className="mt-1 text-sm text-gray-500">填写订单信息，快速匹配车型</p>
      </div>

      <div className="space-y-6">
        <Card title="地址信息">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center pt-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div className="w-px flex-1 bg-gray-200 my-2"></div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <MapPin className="h-4 w-4 text-red-600" />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      起点地址
                    </label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, origin: e.target.value }))
                      }
                      placeholder="请输入起点地址"
                      className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/10"
                    />
                  </div>
                  <div className="w-40">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      楼层
                    </label>
                    <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50">
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            originFloor: Math.max(1, prev.originFloor - 1),
                          }))
                        }
                        className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={formData.originFloor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            originFloor: Math.min(
                              30,
                              Math.max(1, parseInt(e.target.value) || 1)
                            ),
                          }))
                        }
                        className="h-10 flex-1 bg-transparent text-center text-sm text-gray-700 focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            originFloor: Math.min(30, prev.originFloor + 1),
                          }))
                        }
                        className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-24">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      电梯
                    </label>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          originHasElevator: !prev.originHasElevator,
                        }))
                      }
                      className={cn(
                        'h-10 w-full rounded-lg border text-sm font-medium transition-colors',
                        formData.originHasElevator
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                      )}
                    >
                      {formData.originHasElevator ? '有电梯' : '无电梯'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleSwapLocations}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#165DFF] hover:text-[#165DFF]"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      终点地址
                    </label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, destination: e.target.value }))
                      }
                      placeholder="请输入终点地址"
                      className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/10"
                    />
                  </div>
                  <div className="w-40">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      楼层
                    </label>
                    <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50">
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            destFloor: Math.max(1, prev.destFloor - 1),
                          }))
                        }
                        className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={formData.destFloor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            destFloor: Math.min(
                              30,
                              Math.max(1, parseInt(e.target.value) || 1)
                            ),
                          }))
                        }
                        className="h-10 flex-1 bg-transparent text-center text-sm text-gray-700 focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            destFloor: Math.min(30, prev.destFloor + 1),
                          }))
                        }
                        className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-24">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      电梯
                    </label>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          destHasElevator: !prev.destHasElevator,
                        }))
                      }
                      className={cn(
                        'h-10 w-full rounded-lg border text-sm font-medium transition-colors',
                        formData.destHasElevator
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                      )}
                    >
                      {formData.destHasElevator ? '有电梯' : '无电梯'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">预计距离：</span>
              <span className="text-sm font-medium text-gray-800">
                {formData.distance.toFixed(1)} 公里
              </span>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={formData.distance}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    distance: parseFloat(e.target.value),
                  }))
                }
                className="ml-4 flex-1 accent-[#165DFF]"
              />
            </div>
          </div>
        </Card>

        <Card title="货物信息">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">使用场景</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {scenarioOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleScenarioChange(option.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border px-3 py-3 text-sm transition-colors',
                        formData.cargoScenario === option.value
                          ? 'border-[#165DFF] bg-[#165DFF]/5 text-[#165DFF]'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.cargoScenario === '搬家' && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">大件物品清单</label>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setShowLargeItemModal(true)}
                  >
                    编辑大件
                  </Button>
                </div>
                {formData.largeItems && formData.largeItems.length > 0 ? (
                  <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                    {formData.largeItems.map((selected) => {
                      const ItemIcon = getItemIcon(selected.item.icon);
                      return (
                        <div
                          key={selected.item.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <ItemIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {selected.item.name} × {selected.quantity}
                            </span>
                          </div>
                          <span className="text-sm text-orange-500">
                            +{formatMoney(selected.item.handlingFee * selected.quantity)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-200 pt-2 text-xs text-gray-500">
                      共 {formData.largeItemCount} 件大件
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-600">
                    请选择您的大件物品，系统将自动计算搬运费用
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Scale className="h-4 w-4 text-gray-400" />
                  重量 (吨)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weight: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="请输入重量"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Box className="h-4 w-4 text-gray-400" />
                  体积 (方)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.volume || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      volume: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="请输入体积"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Sparkles className="h-4 w-4" />}
              onClick={handleAutoMatch}
              className="w-full"
            >
              智能匹配车型
            </Button>
          </div>
        </Card>

        <Card title="车型选择">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {vehicleTypes.map((type) => {
              const pricing = VEHICLE_PRICING[type];
              const isRecommended = recommendedVehicle === type;
              const isSelected = formData.vehicleType === type;

              return (
                <button
                  key={type}
                  onClick={() => setFormData((prev) => ({ ...prev, vehicleType: type }))}
                  className={cn(
                    'relative rounded-lg border-2 p-4 text-left transition-all',
                    isSelected
                      ? 'border-[#165DFF] bg-[#165DFF]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  {isRecommended && (
                    <div className="absolute -right-1 -top-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                      <Sparkles className="h-3 w-3" />
                      推荐
                    </div>
                  )}

                  <div className="mb-3 flex h-12 items-center justify-center rounded-lg bg-gray-50">
                    <Truck
                      className={cn(
                        'h-8 w-8',
                        isSelected ? 'text-[#165DFF]' : 'text-gray-400'
                      )}
                    />
                  </div>

                  <h4
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-[#165DFF]' : 'text-gray-800'
                    )}
                  >
                    {pricing.name}
                  </h4>

                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>载重</span>
                      <span>{pricing.loadCapacity}吨</span>
                    </div>
                    <div className="flex justify-between">
                      <span>容积</span>
                      <span>{pricing.volumeCapacity}方</span>
                    </div>
                    <div className="flex justify-between">
                      <span>起步价</span>
                      <span className="text-orange-500">¥{pricing.baseFare}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#165DFF]">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="服务选项">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">搬运上下楼</p>
                  <p className="text-xs text-gray-500">需要司机帮忙搬运货物上下楼</p>
                </div>
              </div>
              <button
                onClick={() =>
                  setFormData((prev) => ({ ...prev, needHandling: !prev.needHandling }))
                }
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  formData.needHandling ? 'bg-[#165DFF]' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all shadow-sm',
                    formData.needHandling ? 'left-5' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Box className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">大件数量</p>
                  <p className="text-xs text-gray-500">
                    {formData.cargoScenario === '搬家' && formData.largeItems && formData.largeItems.length > 0
                      ? '由大件物品清单自动计算'
                      : '大件物品额外收费'}
                  </p>
                </div>
              </div>
              <div className="flex items-center rounded-lg border border-gray-200">
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      largeItemCount: Math.max(0, prev.largeItemCount - 1),
                      largeItems: [],
                    }))
                  }
                  disabled={formData.cargoScenario === '搬家' && formData.largeItems && formData.largeItems.length > 0}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center transition-colors',
                    formData.cargoScenario === '搬家' && formData.largeItems && formData.largeItems.length > 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <span className={cn(
                  'w-8 text-center text-sm',
                  formData.cargoScenario === '搬家' && formData.largeItems && formData.largeItems.length > 0
                    ? 'text-[#165DFF] font-medium'
                    : 'text-gray-700'
                )}>
                  {formData.largeItemCount}
                </span>
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      largeItemCount: prev.largeItemCount + 1,
                      largeItems: [],
                    }))
                  }
                  disabled={formData.cargoScenario === '搬家' && formData.largeItems && formData.largeItems.length > 0}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center transition-colors',
                    formData.cargoScenario === '搬家' && formData.largeItems && formData.largeItems.length > 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">预约时间</p>
                  <p className="text-xs text-gray-500">选择用车时间</p>
                </div>
              </div>
              <input
                type="datetime-local"
                value={
                  formData.appointmentTime
                    ? new Date(formData.appointmentTime.getTime() - formData.appointmentTime.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    appointmentTime: e.target.value ? new Date(e.target.value) : null,
                  }))
                }
                className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/10"
              />
            </div>
          </div>
        </Card>

        <Card
          title={
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#165DFF]" />
              <span>费用预估</span>
            </div>
          }
        >
          {fareDetail ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">起步价</span>
                <span className="text-gray-700">{formatMoney(fareDetail.baseFare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">里程费</span>
                <span className="text-gray-700">{formatMoney(fareDetail.mileageFare)}</span>
              </div>
              {formData.needHandling && fareDetail.floorFareDetail && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      楼层费
                      <span className="ml-1 text-xs text-gray-400">
                        (起点{fareDetail.floorFareDetail.originHasElevator ? '有电梯' : '无电梯'} × {fareDetail.floorFareDetail.origin}层 +
                         终点{fareDetail.floorFareDetail.destHasElevator ? '有电梯' : '无电梯'} × {fareDetail.floorFareDetail.dest}层)
                      </span>
                    </span>
                    <span className="text-gray-700">{formatMoney(fareDetail.floorFare)}</span>
                  </div>
                  {fareDetail.floorFareDetail.originSegments.map((seg, idx) => (
                    <div key={`o-${idx}`} className="flex justify-between text-xs text-gray-400 pl-2">
                      <span>起点{seg.label}: {seg.floors}层 × {formatMoney(seg.pricePerFloor)}/层</span>
                      <span>{formatMoney(seg.amount)}</span>
                    </div>
                  ))}
                  {fareDetail.floorFareDetail.destSegments.map((seg, idx) => (
                    <div key={`d-${idx}`} className="flex justify-between text-xs text-gray-400 pl-2">
                      <span>终点{seg.label}: {seg.floors}层 × {formatMoney(seg.pricePerFloor)}/层</span>
                      <span>{formatMoney(seg.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {fareDetail.largeItemFareDetail && fareDetail.largeItemFareDetail.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">大件费</span>
                    <span className="text-gray-700">{formatMoney(fareDetail.largeItemFare)}</span>
                  </div>
                  {fareDetail.largeItemFareDetail.map((item) => (
                    <div key={item.itemId} className="flex justify-between text-xs text-gray-400 pl-2">
                      <span>{item.itemName}: {item.quantity}件 × {formatMoney(item.handlingFee)}/件</span>
                      <span>{formatMoney(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              ) : formData.largeItemCount > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">大件费</span>
                  <span className="text-gray-700">{formatMoney(fareDetail.largeItemFare)}</span>
                </div>
              ) : null}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-gray-500">预估总价</span>
                  <span className="text-2xl font-bold text-orange-500">
                    {formatMoney(fareDetail.totalFare)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-gray-400">
              请选择车型后查看费用明细
            </div>
          )}
        </Card>
      </div>

      <div className="fixed bottom-0 left-60 right-0 border-t border-gray-200 bg-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">预估费用：</span>
            <span className="text-2xl font-bold text-orange-500">
              {fareDetail ? formatMoney(fareDetail.totalFare) : '¥0.00'}
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handleCancel} icon={<X className="h-4 w-4" />}>
              取消
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!formData.vehicleType || !formData.origin || !formData.destination}
            >
              提交订单
            </Button>
          </div>
        </div>
      </div>

      {showLargeItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">选择大件物品</h3>
                <p className="mt-1 text-sm text-gray-500">请选择您需要搬运的大件物品，每件将自动计算搬运费</p>
              </div>
              <button
                onClick={() => setShowLargeItemModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {LARGE_ITEMS.map((item) => {
                  const quantity = selectedLargeItems.get(item.id) || 0;
                  const ItemIcon = getItemIcon(item.icon);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'rounded-lg border-2 p-3 transition-all',
                        quantity > 0
                          ? 'border-[#165DFF] bg-[#165DFF]/5'
                          : 'border-gray-200 bg-white'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            quantity > 0 ? 'bg-[#165DFF]/10' : 'bg-gray-100'
                          )}>
                            <ItemIcon className={cn(
                              'h-4 w-4',
                              quantity > 0 ? 'text-[#165DFF]' : 'text-gray-400'
                            )} />
                          </div>
                          <div>
                            <p className={cn(
                              'text-sm font-medium',
                              quantity > 0 ? 'text-[#165DFF]' : 'text-gray-800'
                            )}>
                              {item.name}
                            </p>
                            <p className="text-xs text-orange-500">
                              +{formatMoney(item.handlingFee)}/件
                            </p>
                          </div>
                        </div>
                        {quantity > 0 && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#165DFF]">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-1 text-xs text-gray-400">{item.description}</p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {item.weight && <span>约{item.weight * 1000}kg </span>}
                          {item.volume && <span>{item.volume}m³</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleItemQuantityChange(item.id, -1)}
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full text-sm transition-colors',
                              quantity > 0
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            )}
                            disabled={quantity === 0}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-gray-700">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleItemQuantityChange(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#165DFF]/10 text-[#165DFF] hover:bg-[#165DFF]/20"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">已选大件：</span>
                  <span className="text-sm font-medium text-gray-700">
                    {Array.from(selectedLargeItems.values()).reduce((a, b) => a + b, 0)} 件
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm text-gray-500">预计搬运费：</span>
                  <span className="text-lg font-bold text-orange-500">
                    {formatMoney(
                      Array.from(selectedLargeItems.entries()).reduce((total, [itemId, qty]) => {
                        const item = LARGE_ITEMS.find((i) => i.id === itemId);
                        return total + (item ? item.handlingFee * qty : 0);
                      }, 0)
                    )}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowLargeItemModal(false)}>
                    取消
                  </Button>
                  <Button onClick={handleConfirmLargeItems}>
                    确认选择
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
