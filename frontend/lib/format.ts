const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("ko-KR");

export function formatDateLabel(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatTimeLabel(value: string) {
  return timeFormatter.format(new Date(value));
}

export function formatDateTimeLabel(value: string) {
  return `${formatDateLabel(value)} ${formatTimeLabel(value)}`;
}

export function formatCurrency(value: number | string) {
  return currencyFormatter.format(Number(value));
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}
