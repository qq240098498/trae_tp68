export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const getTimeDiff = (start: Date, end: Date): number => {
  const diff = end.getTime() - start.getTime();
  return Math.round(diff / (1000 * 60));
};

export const isOverdue = (appointmentTime: Date, bufferMinutes: number = 30): boolean => {
  const deadline = addMinutes(appointmentTime, bufferMinutes);
  return new Date() > deadline;
};
