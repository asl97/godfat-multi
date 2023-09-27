import { css } from "@emotion/react";
import { useQuery } from "react-query";

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

export const sortGodfatUrlQueryParams = (
  url: string,
  firstNonPlatBanner: string
) => {
  // The query params must be sorted in this exact order, otherwise we get 302'd which messes with the CORS proxy
  // See https://gitlab.com/godfat/battle-cats-rolls/-/blob/master/lib/battle-cats-rolls/route.rb?ref_type=heads#L428-436
  const correctOrderQueryParams = [
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
  const urlObj = new URL(url);

  if (
    urlObj.searchParams.has("event") &&
    urlObj.searchParams.get("event") === firstNonPlatBanner
  ) {
    urlObj.searchParams.delete("event");
  }

  const updatedParams = [];
  for (const param of correctOrderQueryParams) {
    if (urlObj.searchParams.has(param)) {
      const value = urlObj.searchParams.get(param);
      updatedParams.push([`${param}=${value}`]);
    }
  }
  const sortedUpdatedParams = `/?${updatedParams.join("&")}`;
  console.log(sortedUpdatedParams);
  return `${urlObj.origin}${sortedUpdatedParams}`;
};

export const useGodfatQuery = (page: string) => {
  if (new URL(page).hostname !== "bc.godfat.org") {
    return {
      isValidationError: true,
      query: null,
    };
  }

  const query = useQuery({
    queryKey: [page],
    queryFn: () => fetch(`https://corsproxy.io/?${encodeURIComponent(page)}`),
    staleTime: Infinity,
  });

  return {
    isValidationError: false,
    query,
  };
};
