export type OutputEntrySingle = {
  catName: string;
  num: number;
  track: string;
  nextNum: number;
  nextTrack: string;
  nextSeed: string;
};

export type OutputEntryGuarantee = {
  guaranteeCatName: string;
  trackCatNames: string[];
  startNum: number;
  startTrack: string;
  endNum: number;
  endTrack: string;
  nextNum: number;
  nextTrack: string;
  nextSeed: string;
};

export type OutputEntry = {
  bannerLabel: string;
  single?: Partial<OutputEntrySingle>;
  guarantee?: Partial<OutputEntryGuarantee>;
};
