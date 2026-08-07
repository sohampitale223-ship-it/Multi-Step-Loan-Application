export function formatINR(value) {
  if (value === "" || value === null || value === undefined) return "";
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value))}`;
}
