export const formatMoney = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters}米`;
  }
  return `${km.toFixed(1)}公里`;
};

const padZero = (num: number): string => {
  return num.toString().padStart(2, '0');
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = padZero(d.getMonth() + 1);
  const day = padZero(d.getDate());
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  const dateStr = formatDate(d);
  const hours = padZero(d.getHours());
  const minutes = padZero(d.getMinutes());
  return `${dateStr} ${hours}:${minutes}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
};

export const generateOrderNo = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = padZero(now.getMonth() + 1);
  const day = padZero(now.getDate());
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HY${year}${month}${day}${random}`;
};
