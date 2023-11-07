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
  seed,
  count,
}: {
  startingUrl: string;
  seed: string;
  count: number;
}) => {
  const url = new URL(startingUrl);
  url.searchParams.set("seed", seed);
  url.searchParams.set("count", count.toString());
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
