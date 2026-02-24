export const corsUrl = (url: string) =>
  `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
