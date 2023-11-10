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
  single?: OutputEntrySingle;
  guarantee?: OutputEntryGuarantee;
};

export type OutputEntryWithTemplatedFields = {
  banner: string;
  newSeed: string;
  catNames: string[];
  guaranteeCatName: string;
  positions: {
    first: string;
    last: string;
    next: string;
  };
};

export const transformSingleForOutput = (outputEntry: OutputEntry) => {
  const single = outputEntry.single!;
  return {
    banner: outputEntry.bannerLabel,
    newSeed: single.nextSeed,
    catNames: [single.catName],
    guaranteeCatName: "",
    positions: {
      first: `${single.num}${single.track}`,
      last: `${single.num}${single.track}`,
      next: `${single.nextNum}${single.nextTrack}`,
    },
  };
};

export const transformMultiForOutput = (outputEntries: OutputEntry[]) => {
  const base: OutputEntryWithTemplatedFields = {
    banner: outputEntries[0].bannerLabel,
    newSeed: "",
    catNames: [],
    guaranteeCatName: "",
    positions: {
      first: "",
      last: "",
      next: "",
    },
  };
  for (const [index, outputEntry] of outputEntries.entries()) {
    const single = outputEntry.single!;
    if (index === 0) {
      base.positions.first = `${single.num}${single.track}`;
    }
    if (index === outputEntries.length - 1) {
      base.positions.last = `${single.num}${single.track}`;
      base.positions.next = `${single.nextNum}${single.nextTrack}`;
      base.newSeed = single.nextSeed;
    }
    base.catNames.push(single.catName);
  }
  return base;
};

export const transformGuaranteeForOutput = (outputEntry: OutputEntry) => {
  const guarantee = outputEntry.guarantee!;
  return {
    banner: outputEntry.bannerLabel,
    newSeed: guarantee.nextSeed,
    catNames: guarantee.trackCatNames,
    guaranteeCatName: guarantee.guaranteeCatName,
    positions: {
      first: `${guarantee.startNum}${guarantee.startTrack}`,
      last: `${guarantee.endNum}${guarantee.endTrack}`,
      next: `${guarantee.nextNum}${guarantee.nextTrack}`,
    },
  };
};
