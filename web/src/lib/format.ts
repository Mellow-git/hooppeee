export function truncateHash(value: string, head = 12, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

export function daysAgo(iso: string, now = new Date("2026-09-30T18:00:00Z")): number {
  const then = new Date(iso);
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}
