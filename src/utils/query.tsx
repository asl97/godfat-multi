export const corsUrl = (url: string) =>
  `https://corsproxy.io/?key=githubio&url=${encodeURIComponent(url)}`;
