import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { corsUrl } from "./query";

const BASE_GODFAT_URL = "https://bc.godfat.org/";

export type BannerSelectOption = {
  groupLabel: string;
  options: {
    value: string;
    label: string;
  }[];
};

const parseBannersFromHtml = (html: Document): BannerSelectOption[] => {
  const eventSelect = html.getElementById("event_select");
  if (!eventSelect) return [];

  const results = [];
  for (const optGroup of eventSelect.children) {
    if ((optGroup as HTMLOptGroupElement).label === "Custom:") {
      continue;
    }

    results.push({
      groupLabel: (optGroup as HTMLOptGroupElement).label,
      options: Array.from(optGroup.children).map((option) => ({
        value: (option as HTMLOptionElement).value,
        label: (option as HTMLOptionElement).text,
      })),
    });
  }

  return results;
};

export const useGodfatBanners = () => {
  const [banners, setBanners] = useState<BannerSelectOption[]>([]);
  const bannerQuery = useQuery({
    queryKey: [BASE_GODFAT_URL],
    queryFn: () => fetch(corsUrl(BASE_GODFAT_URL)),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (banners.length === 0 && bannerQuery?.data) {
      (async () => {
        const dataText = await bannerQuery.data.text();
        const dataDom = new DOMParser().parseFromString(dataText, "text/html");
        const parsedBanners = parseBannersFromHtml(dataDom);
        setBanners(parsedBanners);
      })();
    }
  }, [bannerQuery]);

  return {
    isLoading: bannerQuery.isLoading || banners.length === 0,
    isError: bannerQuery.isError || banners.length === 0,
    banners,
  };
};

// Mostly copied from godfat HTML
export const godfatCss = css`
  * {
    margin: 0;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.43;
    letter-spacing: 0.01071em;
  }

  #notice {
    background-color: pink;
  }

  table {
    border-collapse: collapse;
  }
  table,
  td {
    white-space: nowrap;
    text-align: center;
  }
  th {
    border: 1px solid black;
    font-weight: bold;
  }

  td:empty::after {
    content: "\\00a0";
  }

  .rare {
    background-color: white;
  }
  .owned {
    background-color: azure;
  }

  .supa_fest {
    background-color: yellow;
  }
  .supa {
    background-color: gold;
  }
  .uber_fest {
    background-color: salmon;
  }
  .uber {
    background-color: red;
  }
  .exclusive {
    background-color: aqua;
  }
  .found {
    background-color: lime;
  }
  .legend {
    background-color: darkviolet;
  }
  .attack {
    background-color: lavender;
  }
  .triggered_attack {
    background-color: pink;
  }

  .legend a,
  .legend {
    color: #d8a56f;
  }
  .navigate {
    cursor: help;
  }
  .pick {
    cursor: cell;
  }
  .picked {
    background-image: linear-gradient(#00000033, #00000033);
  }
  .picked_consecutively {
    background-image: linear-gradient(#00000088, #00000088);
  }
  .next_position {
    background-image: repeating-linear-gradient(
      90deg,
      #00000055 5px,
      #00000055 15px,
      #00000033 15px,
      #00000033 25px
    );
  }
  #seed_input {
    width: 10em;
  }
  #count_input,
  #level_input {
    width: 3.5em;
  }
  #rare_input,
  #supa_input,
  #uber_input {
    width: 5em;
  }
  .menu {
    width: 60px;
    height: 60px;
  }
  .section {
    margin-bottom: 15px;
  }
  .border,
  .border_upper,
  .border_lower {
    border: 2px solid;
  }
  .border_upper {
    border-bottom: none;
  }
  .border_lower {
    border-top: none;
  }
  .border_middle {
    border-left: 2px solid;
    border-right: 2px solid;
  }
  .border_bottom {
    border-top: 2px solid;
  }

  .score,
  .cat {
    border-bottom-style: none;
  }
  .cat {
    border-top-style: none;
  }
`;

export const isGodfatUrl = (url: string) => {
  try {
    return new URL(url).hostname === "bc.godfat.org";
  } catch (_) {
    return false;
  }
};

export const urlInputToGodfatUrl = ({
  selectedBanner,
  numFutureUbers,
}: {
  selectedBanner: string;
  numFutureUbers: number;
}) => {
  const baseUrl = new URL(BASE_GODFAT_URL);
  baseUrl.searchParams.set("ubers", numFutureUbers.toString());
  baseUrl.searchParams.set("event", selectedBanner);
  return baseUrl.toString();
};

export const augmentGodfatUrlWithGlobalConfig = ({
  startingUrl,
  overrideSeeds,
  seed,
}: {
  startingUrl: string;
  overrideSeeds: boolean;
  seed: string;
}) => {
  const url = new URL(startingUrl);
  if (overrideSeeds || !url.searchParams.has("seed")) {
    url.searchParams.set("seed", seed);
  }
  return url.toString();
};

export const sanitizeGodfatUrl = ({
  startingUrl,
  banners,
}: {
  startingUrl: string;
  banners: BannerSelectOption[];
}) => {
  const url = new URL(startingUrl);

  // Godfat strips params from the URL for default values, see
  // https://gitlab.com/godfat/battle-cats-rolls/-/blob/master/lib/battle-cats-rolls/route.rb?ref_type=heads#L468
  const firstNonPlatBanner =
    banners[0].options?.find(
      (o) =>
        !o.label.toLowerCase().includes("platinum capsules") &&
        !o.label.toLowerCase().includes("legend capsules")
    )?.value || "";

  const DELETE_VALUES = {
    seed: "0",
    lang: "en",
    name: "0",
    theme: "",
    count: "100",
    find: "0",
    last: "0",
    force_guaranteed: "0",
    ubers: "0",
    o: "",
    event: firstNonPlatBanner,
  };

  for (const [key, value] of Object.entries(DELETE_VALUES)) {
    if (url.searchParams.has(key) && url.searchParams.get(key) === value) {
      url.searchParams.delete(key);
    }
  }

  // The query params must be sorted in this exact order, otherwise we get 302'd which messes with the CORS proxy
  // See https://gitlab.com/godfat/battle-cats-rolls/-/blob/master/lib/battle-cats-rolls/route.rb?ref_type=heads#L428-436
  const CORRECT_ORDER_PARAMS = [
    "seed",
    "last",
    "event",
    "custom",
    "rate",
    "c_rare",
    "c_supa",
    "c_uber",
    "level",
    "lang",
    "version",
    "name",
    "theme",
    "count",
    "find",
    "no_guaranteed",
    "force_guaranteed",
    "ubers",
    "details",
    "hide_wave",
    "sum_no_wave",
    "dps_no_critical",
    "o",
  ];

  const updatedParams = [];
  for (const param of CORRECT_ORDER_PARAMS) {
    if (url.searchParams.has(param)) {
      const value = url.searchParams.get(param);
      updatedParams.push([`${param}=${value}`]);
    }
  }
  const sortedUpdatedParams = `/?${updatedParams.join("&")}`;
  return `${url.origin}${sortedUpdatedParams}`;
};
