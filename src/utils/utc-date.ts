function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatUtcDate(date: Date): string {
  const year = String(date.getUTCFullYear());
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());

  return `${year}-${month}-${day}`;
}

export function formatUtcTimestamp(date: Date): string {
  const year = String(date.getUTCFullYear());
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  const hour = pad2(date.getUTCHours());
  const minute = pad2(date.getUTCMinutes());
  const second = pad2(date.getUTCSeconds());

  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}
