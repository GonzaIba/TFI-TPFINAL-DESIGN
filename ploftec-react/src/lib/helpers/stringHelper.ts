export const truncate = (text: string, max = 150): string =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
