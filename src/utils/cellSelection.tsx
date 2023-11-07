// Format: num(int);track(A|B);mainCat(bool);guaranteed(bool)

export const serSelectedCell = ({
  bannerUrl,
  num,
  track,
  isMainCat,
  isGuaranteed,
}: {
  bannerUrl: string;
  num: number;
  track: "A" | "B";
  isMainCat: boolean;
  isGuaranteed: boolean;
}) => `${bannerUrl};${num};${track};${isMainCat};${isGuaranteed}`;

export const desSelectedCell = (
  str: string
): {
  bannerUrl: string;
  num: number;
  track: "A" | "B";
  isMainCat: boolean;
  isGuaranteed: boolean;
} => {
  const split = str.split(";");
  return {
    bannerUrl: split[0],
    num: parseInt(split[1], 10),
    track: split[2] as "A" | "B",
    isMainCat: split[3] === "true",
    isGuaranteed: split[4] === "true",
  };
};
