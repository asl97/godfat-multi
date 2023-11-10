/** @jsx jsx */
import React from "react";
import { Box, Modal, Typography } from "@mui/material";
import { css, jsx } from "@emotion/react";
import { MutableRefObject } from "react";
import { OutputEntry } from "./utils/output";

const boxCss = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 80vw;
  background-color: white;
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

export default function PlannedOutputModal({
  plannedOutputRef,
  open,
  closePlannedOutputModal,
}: {
  plannedOutputRef: MutableRefObject<OutputEntry[]>;
  open: boolean;
  closePlannedOutputModal: () => void;
}) {
  const plannedOutput = plannedOutputRef.current;
  const collapsedPlanOutput = collapsePlannedOutput(plannedOutput);
  console.log(collapsedPlanOutput);
  return (
    <Modal open={open} onClose={closePlannedOutputModal}>
      <Box css={boxCss}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Text in a modal
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
        </Typography>
      </Box>
    </Modal>
  );
}
