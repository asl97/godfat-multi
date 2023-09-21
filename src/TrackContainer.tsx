/** @jsx jsx */
import React, { useEffect, Fragment } from "react";
import { css, jsx } from "@emotion/react";
import { godfatCss } from "./utils/godfat";
import { Typography } from "@mui/material";
import { useQueries } from "react-query";
import styled from "@emotion/styled";
import { ConfigData } from "./Page";
import { CellData } from "./TracksContainer";

type CatCell = {
  class: string;
  mainCat: string;
  altCat?: string;
  guaranteeMainCat?: string;
  guaranteeAltCat?: string;
};

const zip = (arr: any[]) =>
  Array(Math.min(...arr.map((a) => a.length)))
    .fill(0)
    .map((_, i) => arr.map((a) => a[i]));

const parseTargetFromText = (text: string | null): string => {
  const pattern = "\\d+[a-zA-Z]+";
  const regex = new RegExp(pattern, "g");
  const matches = text?.match(regex);
  if (!matches) {
    return "";
  }
  return matches[0];
};

const removePickAndCatFromClass = (className: string): string => {
  // We only want the rarity CSS
  return className
    .split(" ")
    .filter((c) => c !== "pick" && c !== "cat")
    .join(" ");
};

const extractCatStringFromTd = (td: HTMLElement): string => {
  return td.textContent!.replace("🐾", "").replace("\n", "").trim();
};

const extractCats = (table: HTMLElement, track: "A" | "B"): CatCell[] => {
  const trackA = track === "A";
  const res: CatCell[] = [];

  let numDataRows = 0;
  let numSkipRows = 0;
  let currentCatCell: CatCell | null = null;
  for (const row of table.getElementsByTagName("tr")) {
    const lastIndex = row.children.length - 1;

    const dataRowsDeterminer =
      row.children[trackA ? 0 : lastIndex].getAttribute("rowspan");
    const skipRowsDeterminer =
      row.children[trackA ? 1 : lastIndex - 1].getAttribute("rowspan");
    if (
      isNaN(Number(dataRowsDeterminer)) ||
      isNaN(Number(skipRowsDeterminer))
    ) {
      continue;
    }

    if (numSkipRows > 0) {
      // Skip this row
      numSkipRows--;
      numDataRows--;
    } else if (numDataRows > 0) {
      // Still have more data to read
      const normalCol = row.children[trackA ? 0 : lastIndex - 1];
      const guaranteeCol = row.children[trackA ? 1 : lastIndex];
      const data = extractCatStringFromTd(normalCol as HTMLElement);
      const guaranteeData = extractCatStringFromTd(guaranteeCol as HTMLElement);
      if (currentCatCell?.mainCat) {
        currentCatCell.altCat = data;
        currentCatCell.guaranteeAltCat = guaranteeData;
      } else {
        currentCatCell = {
          class: removePickAndCatFromClass(normalCol.getAttribute("class")!),
          mainCat: data,
          guaranteeMainCat: guaranteeData,
        };
      }
      numDataRows--;
    } else {
      // Start a new data section, but don't read the current row (it's blank)
      if (currentCatCell) {
        res.push(currentCatCell);
        currentCatCell = null;
      }
      numDataRows = Number(dataRowsDeterminer) - 1;
      numSkipRows = Number(skipRowsDeterminer) - 1;
    }
  }
  if (currentCatCell) {
    res.push(currentCatCell);
  }

  return res;
};

const hoveredCss = css`
  opacity: 0.8;
`;

const LabelTd = styled.td`
  border: 1px solid black;
  background-color: #f5f5f5;
`;

const TopTd = styled.td<{ isGuarantee?: boolean }>`
  border: 1px solid black;
  border-bottom-style: none;
  ${({ isGuarantee }) =>
    isGuarantee ? `background-color: #f5f5f5 !important;` : ""}
`;

const BottomTd = styled.td<{ isGuarantee?: boolean }>`
  border: 1px solid black;
  border-top-style: none;
  ${({ isGuarantee }) =>
    isGuarantee ? `background-color: #f5f5f5 !important;` : ""}
`;

const StickyRow = styled.tr`
  position: sticky;
  top: 0;
  background-color: white;
  box-shadow: inset 0 1px 0 black, inset 0 -1px 0 black, inset 1px 0 0 black,
    inset -1px 0 0 black;
`;

export default function TrackContainer({
  configData,
  track,
  hoveredCell,
  setHoveredCell,
}: {
  configData: ConfigData;
  track: "A" | "B";
  hoveredCell: CellData;
  setHoveredCell: (cell: CellData) => void;
}) {
  if (configData.bannerData.length === 0) {
    return <Fragment />;
  }

  const urls = configData.bannerData.map((datum) => datum.url);
  const [parsedQueryData, setParsedQueryData] = React.useState<CatCell[][]>([]);

  const queries = useQueries(
    urls.map((url) => ({
      queryKey: [url],
      queryFn: () => fetch(url),
      staleTime: Infinity,
    }))
  );

  const allQueriesResolved = queries.every((query) => query.isFetched);

  useEffect(() => {
    const parseQueryResult = async () => {
      const res = [];
      const successfulQueries = queries.filter((query) => query.isSuccess);
      for (const query of successfulQueries) {
        const dataText = await query.data!.clone().text(); // Inefficient (parallelizable). Who cares?
        const dataDom = new DOMParser().parseFromString(dataText, "text/html");
        const dataTable = dataDom.getElementsByTagName("table")[0]; // Godfat page is guaranteed to have one table
        const trackCats = extractCats(dataTable, track);
        res.push(trackCats);
      }
      setParsedQueryData(res);
    };
    parseQueryResult();

    return () => {};
  }, [allQueriesResolved, queries.length]);

  if (parsedQueryData.length === 0) {
    return <Fragment />;
  }
  if (!allQueriesResolved) {
    return <Typography variant="h5">Loading track {track}...</Typography>;
  }

  const zippedQueryData = zip(parsedQueryData);
  const isGuaranteedArray = zippedQueryData[0].map((catCell) =>
    Boolean(catCell.guaranteeMainCat)
  );

  return (
    <div css={godfatCss}>
      <table css={{ backgroundColor: "black" }}>
        <tbody>
          <StickyRow>
            <th>No.</th>
            {zippedQueryData[0].map((_, i) => (
              <th key={i} colSpan={isGuaranteedArray[i] ? 2 : 1}>
                {Boolean(configData.bannerData[i].label)
                  ? configData.bannerData[i].label
                  : "Banner " + (i + 1)}
              </th>
            ))}
          </StickyRow>
          {track === "B" && (
            <tr>
              <td
                style={{
                  border: "1px solid black",
                  backgroundColor: "white",
                }}
                colSpan={isGuaranteedArray.reduce(
                  (sum, guaranteed) => sum + (guaranteed ? 2 : 1),
                  1
                )}
              />
            </tr>
          )}
          {zippedQueryData.map((row, i) => {
            const rowLabel = `${i + 1}${track}`;
            const hover =
              hoveredCell.row === rowLabel || hoveredCell.target === rowLabel;
            return (
              <Fragment key={i}>
                <tr>
                  <LabelTd rowSpan={2} css={hover && hoveredCss}>
                    {rowLabel}
                  </LabelTd>
                  {row.map((catCell, j) => {
                    // Top row
                    const isTrackSwitchCell = Boolean(catCell.altCat);
                    const isGuaranteeCell = isGuaranteedArray[j];
                    return (
                      <Fragment key={j}>
                        <TopTd
                          className={catCell.class}
                          onMouseOver={(e) => {
                            e.stopPropagation();
                            const text = isTrackSwitchCell
                              ? catCell.mainCat
                              : catCell.altCat;
                            const bottomText = isTrackSwitchCell
                              ? catCell.altCat
                              : catCell.mainCat;
                            setHoveredCell({
                              row: rowLabel,
                              text: Boolean(text) ? text : bottomText,
                              target: Boolean(text)
                                ? parseTargetFromText(text)
                                : parseTargetFromText(bottomText),
                            });
                          }}
                          css={hover && hoveredCss}
                        >
                          {isTrackSwitchCell ? catCell.mainCat : catCell.altCat}
                        </TopTd>
                        {isGuaranteeCell && (
                          <TopTd
                            isGuarantee
                            onMouseOver={(e) => {
                              e.stopPropagation();
                              const text = isTrackSwitchCell
                                ? catCell.guaranteeMainCat
                                : catCell.guaranteeAltCat;
                              const bottomText = isTrackSwitchCell
                                ? catCell.guaranteeAltCat
                                : catCell.guaranteeMainCat;
                              setHoveredCell({
                                row: rowLabel,
                                text: Boolean(text) ? text : bottomText,
                                target: Boolean(text)
                                  ? parseTargetFromText(text)
                                  : parseTargetFromText(bottomText),
                              });
                            }}
                            css={hover && hoveredCss}
                          >
                            {isTrackSwitchCell
                              ? catCell.guaranteeMainCat
                              : catCell.guaranteeAltCat}
                          </TopTd>
                        )}
                      </Fragment>
                    );
                  })}
                </tr>
                <tr>
                  {row.map((catCell, j) => {
                    // Bottom row
                    const isTrackSwitchCell = Boolean(catCell.altCat);
                    const isGuaranteeCell = isGuaranteedArray[j];
                    return (
                      <Fragment key={j}>
                        <BottomTd
                          className={catCell.class}
                          onMouseOver={(e) => {
                            e.stopPropagation();
                            const text = isTrackSwitchCell
                              ? catCell.altCat
                              : catCell.mainCat;
                            setHoveredCell({
                              row: rowLabel,
                              text: text || "",
                              target: parseTargetFromText(text),
                            });
                          }}
                          css={hover && hoveredCss}
                        >
                          {isTrackSwitchCell ? catCell.altCat : catCell.mainCat}
                        </BottomTd>
                        {isGuaranteeCell && (
                          <BottomTd
                            isGuarantee
                            onMouseOver={(e) => {
                              e.stopPropagation();
                              const text = isTrackSwitchCell
                                ? catCell.guaranteeAltCat
                                : catCell.guaranteeMainCat;
                              setHoveredCell({
                                row: rowLabel,
                                text: text || "",
                                target: parseTargetFromText(text),
                              });
                            }}
                            css={hover && hoveredCss}
                          >
                            {isTrackSwitchCell
                              ? catCell.guaranteeAltCat
                              : catCell.guaranteeMainCat}
                          </BottomTd>
                        )}
                      </Fragment>
                    );
                  })}
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
