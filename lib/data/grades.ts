export const GRADES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Grade ${i + 1}`,
}));
