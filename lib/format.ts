export function formatEGP(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(num)} جنيه`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function generateOrderNumber(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DKN-${stamp}-${rand}`;
}
