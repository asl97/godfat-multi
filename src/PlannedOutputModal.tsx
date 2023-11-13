/** @jsx jsx */
import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import { css, jsx } from "@emotion/react";
import { MutableRefObject } from "react";
import {
  OutputEntry,
  OutputEntryWithTemplatedFields,
  transformGuaranteeForOutput,
  transformMultiForOutput,
  transformSingleForOutput,
} from "./utils/output";
import { HighlightWithinTextarea } from "react-highlight-within-textarea";
import { Cached } from "@mui/icons-material";
import { useStorageLinkedString } from "./utils/config";

export const DEFAULT_SINGLE_TEMPLATE =
  "$POS.FIRST: 1x on **$BANNER** for $CATS.FIRST, next pull is $POS.NEXT (*$NEWSEED*)";
export const DEFAULT_MULTI_TEMPLATE =
  "$POS.FIRST-$POS.LAST: $CATS.COUNTx on **$BANNER** for $CATS.FIRST - $CATS.LAST, next pull is $POS.NEXT (*$NEWSEED*)";
export const DEFAULT_GUARANTEE_TEMPLATE =
  "$POS.FIRST-$POS.LAST: Guaranteed $CATS.COUNTx on **$BANNER** for $CATS.FIRST - $CATS.LAST (+ $CATS.G), next pull is $POS.NEXT (*$NEWSEED*)";

const HIGHLIGHT_ARRAY = [
  {
    highlight: /\$BANNER/g,
    className: "highlight-red",
  },
  {
    highlight: /\$CATS\.(FIRST|LAST|ALL|G|COUNT)/g,
    className: "highlight-yellow",
  },
  {
    highlight: /\$POS\.(FIRST|LAST|NEXT)/g,
    className: "highlight-green",
  },
  {
    highlight: /\$NEWSEED/g,
    className: "highlight-blue",
  },
];
const HIGHLIGHT_STYLES = {
  ".highlight-red": {
    backgroundColor: "#ea9999",
  },
  ".highlight-orange": {
    backgroundColor: "#f9cb9c",
  },
  ".highlight-yellow": {
    backgroundColor: "#ffe599",
  },
  ".highlight-green": {
    backgroundColor: "#b6d7a8",
  },
  ".highlight-blue": {
    backgroundColor: "#a4c2f4",
  },
  ".highlight-purple": {
    backgroundColor: "#b4a7d6",
  },
};

const boxCss = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  background-color: white;

  padding: 20px;
`;

// Single pulls on the same banner can be grouped together
const collapsePlannedOutput = (plannedOutput: OutputEntry[]) => {
  const collapsed: OutputEntry[][] = [];
  for (const planned of plannedOutput) {
    if (planned.guarantee) {
      // Don't collapse guarantees, but add them as an array to keep the same structure
      collapsed.push([planned]);
    } else {
      const last = collapsed[collapsed.length - 1];
      if (!last || last[0].guarantee) {
        // Last entry is ineligible to append into, need to start a new one
        collapsed.push([planned]);
      } else {
        if (last[0].bannerLabel !== planned.bannerLabel) {
          // Different banner, need to start a new one
          collapsed.push([planned]);
        } else {
          last.push(planned);
        }
      }
    }
  }
  return collapsed;
};

const fillTemplate = (
  template: string,
  data: OutputEntryWithTemplatedFields
) => {
  return template
    .replace("$BANNER", data.banner)
    .replace("$NEWSEED", data.newSeed)
    .replace("$CATS.FIRST", data.catNames[0])
    .replace("$CATS.LAST", data.catNames[data.catNames.length - 1])
    .replace("$CATS.ALL", data.catNames.join(", "))
    .replace("$CATS.G", data.guaranteeCatName)
    .replace(
      "$CATS.COUNT",
      (data.catNames.length + (data.guaranteeCatName ? 1 : 0)).toString()
    )
    .replace("$POS.FIRST", data.positions.first)
    .replace("$POS.LAST", data.positions.last)
    .replace("$POS.NEXT", data.positions.next);
};

const constructPlannedOutput = ({
  collapsedPlannedOutput,
  singleTemplate,
  multiTemplate,
  guaranteeTemplate,
}: {
  collapsedPlannedOutput: OutputEntry[][];
  singleTemplate: string;
  multiTemplate: string;
  guaranteeTemplate: string;
}) => {
  const resultLines: string[] = [];
  for (const outputChunk of collapsedPlannedOutput) {
    const first = outputChunk[0];
    if (first.guarantee) {
      // Guaranteed chunk
      resultLines.push(
        fillTemplate(
          guaranteeTemplate,
          transformGuaranteeForOutput(outputChunk[0])
        )
      );
    } else if (outputChunk.length === 1) {
      // Single chunk
      resultLines.push(
        fillTemplate(singleTemplate, transformSingleForOutput(outputChunk[0]))
      );
    } else {
      // Multi chunk
      resultLines.push(
        fillTemplate(multiTemplate, transformMultiForOutput(outputChunk))
      );
    }
  }
  return resultLines.join("\n");
};

const HighlightedInput = ({
  label,
  value,
  onChange,
  reset,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  reset: () => void;
}) => {
  return (
    <div>
      <Typography css={{ color: "rgba(0, 0, 0, 0.6)" }} variant="caption">
        {label}
      </Typography>
      <div css={{ display: "flex", alignItems: "flex-start" }}>
        <div
          css={{
            flex: 1,
            borderRadius: "4px",
            border: "1px solid rgba(0, 0, 0, 0.23)",
            padding: "8px 14px",
            ...HIGHLIGHT_STYLES,
          }}
        >
          <Typography variant="body1" component="div">
            <HighlightWithinTextarea
              placeholder=""
              value={value}
              highlight={HIGHLIGHT_ARRAY}
              onChange={onChange}
            />
          </Typography>
        </div>
        <IconButton onClick={() => reset()}>
          <Cached />
        </IconButton>
      </div>
    </div>
  );
};

export default function PlannedOutputModal({
  plannedOutputRef,
  open,
  closePlannedOutputModal,
}: {
  plannedOutputRef: MutableRefObject<OutputEntry[]>;
  open: boolean;
  closePlannedOutputModal: () => void;
}) {
  const [singleTemplate, setSingleTemplate] =
    useStorageLinkedString("singleTemplate");
  const [multiTemplate, setMultiTemplate] =
    useStorageLinkedString("multiTemplate");
  const [guaranteeTemplate, setGuaranteeTemplate] =
    useStorageLinkedString("guaranteeTemplate");

  const plannedOutput = plannedOutputRef.current;
  const collapsedPlannedOutput = collapsePlannedOutput(plannedOutput);

  const plannedOutputText = constructPlannedOutput({
    collapsedPlannedOutput,
    singleTemplate,
    multiTemplate,
    guaranteeTemplate,
  });

  return (
    <Modal open={open} onClose={closePlannedOutputModal}>
      <Box css={boxCss}>
        <Typography variant="body1">
          <strong>What is this?</strong>
        </Typography>
        <Typography variant="body2">
          Pulls on a banner can be classified into <strong>single pulls</strong>
          , <strong>multiple pulls</strong> (in a row), or a{" "}
          <strong>guaranteed pull</strong>.<br />
          Here you can customize the output template for each type of pull and
          copy the final result. The variables you can use in each line are:
          <ul css={HIGHLIGHT_STYLES}>
            <li>
              <span className="highlight-red">$BANNER</span>: The custom name of
              the banner. If no custom name is set, it will use the default name
              of "Banner 1/2/3"
            </li>
            <li>
              <span className="highlight-yellow">$CATS.FIRST</span>: The name of
              the first cat in the pulls
            </li>
            <li>
              <span className="highlight-yellow">$CATS.LAST</span>: The name of
              the last cat in the pulls, excluding the guarantee
            </li>
            <li>
              <span className="highlight-yellow">$CATS.ALL</span>: A list of all
              cats in the pulls
            </li>
            <li>
              <span className="highlight-yellow">$CATS.G</span>: The name of the
              guaranteed cat
            </li>
            <li>
              <span className="highlight-yellow">$CATS.COUNT</span>: The total
              number of cats pulled, including the guarantee
            </li>
            <li>
              <span className="highlight-green">$POS.FIRST</span>: The track
              position of the first cat in the pulls
            </li>
            <li>
              <span className="highlight-green">$POS.LAST</span>: The track
              position of the last cat in the pulls
            </li>
            <li>
              <span className="highlight-green">$POS.NEXT</span>: The next track
              position after doing the current pulls
            </li>
            <li>
              <span className="highlight-blue">$NEWSEED</span>: The seed after
              doing the current pulls
            </li>
          </ul>
        </Typography>
        <Typography variant="body1">
          <strong>Configuration</strong>
        </Typography>
        <HighlightedInput
          label="Template to use for a single pull"
          value={singleTemplate}
          onChange={(value) => setSingleTemplate(value)}
          reset={() => setSingleTemplate(DEFAULT_SINGLE_TEMPLATE)}
        />
        <HighlightedInput
          label="Template to use for multiple single pulls in a row (on the same banner)"
          value={multiTemplate}
          onChange={(value) => setMultiTemplate(value)}
          reset={() => setMultiTemplate(DEFAULT_MULTI_TEMPLATE)}
        />
        <HighlightedInput
          label="Template to use for a guaranteed pull"
          value={guaranteeTemplate}
          onChange={(value) => setGuaranteeTemplate(value)}
          reset={() => setGuaranteeTemplate(DEFAULT_GUARANTEE_TEMPLATE)}
        />
        <Typography css={{ marginTop: "8px" }} variant="body1">
          <strong>Output</strong>
        </Typography>
        <textarea
          rows={10}
          disabled
          css={{
            resize: "none",
            width: "100%",
            overflow: "scroll",
            boxSizing: "border-box",
          }}
          value={plannedOutputText}
        ></textarea>
        <Button
          css={{ marginTop: "4px" }}
          variant="contained"
          disableElevation
          size="small"
          onClick={() => navigator.clipboard.writeText(plannedOutputText)}
        >
          Copy to clipboard
        </Button>
      </Box>
    </Modal>
  );
}
