const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function toMessageDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function formatMessageTime(value: Date | string) {
  const date = toMessageDate(value);
  return Number.isNaN(date.getTime()) ? "" : timeFormatter.format(date);
}

export function getDateKey(value: Date | string) {
  const date = toMessageDate(value);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatMessageDate(value: Date | string) {
  const date = toMessageDate(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (getDateKey(date) === getDateKey(today)) {
    return "Today";
  }

  if (getDateKey(date) === getDateKey(yesterday)) {
    return "Yesterday";
  }

  return fullDateFormatter.format(date);
}
