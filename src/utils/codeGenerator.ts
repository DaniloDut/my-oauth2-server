export const generateUniqueCode = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
