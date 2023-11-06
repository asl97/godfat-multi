import React, { useEffect } from "react";
import {
  BannerSelectOption,
  augmentGodfatUrlWithGlobalConfig,
  sanitizeGodfatUrl,
} from "./utils/godfat";
import UrlInput from "./UrlInput";
import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import styled from "@emotion/styled";
import { BannerData, ConfigData } from "./Page";
import {
  useStorageLinkedBoolean,
  useStorageLinkedInputs,
  useStorageLinkedString,
} from "./utils/config";

const generateKey = () => Math.random().toString(36).substring(7);

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin: 10px 0;
`;

export default function ConfigContainer({
  banners,
  setConfigData,
}: {
  banners: BannerSelectOption[];
  setConfigData: (data: ConfigData) => void;
}) {
  const [seed, setSeed] = useStorageLinkedString("seed");
  const [overrideSeeds, setOverrideSeeds] =
    useStorageLinkedBoolean("overrideSeeds");
  const [inputs, setInputs] = useStorageLinkedInputs("inputKeys");

  const addNewInput = () => {
    setInputs((inputs) => [
      ...inputs,
      { key: generateKey(), value: { label: "", url: "" } },
    ]);
  };

  const removeInput = (key: string) => {
    setInputs((inputs) => inputs.filter((input) => input.key !== key));
  };

  const setInputValue = (key: string, value: BannerData) => {
    setInputs((inputs) => {
      const index = inputs.findIndex((input) => input.key === key);
      return [
        ...inputs.slice(0, index),
        { key, value },
        ...inputs.slice(index + 1),
      ];
    });
  };

  const onSubmit = () => {
    console.log(inputs);
    const bannerData = inputs.map(({ value }) => {
      const augmentedUrl = augmentGodfatUrlWithGlobalConfig({
        startingUrl: value.url,
        overrideSeeds,
        seed,
      });
      const sanitizedUrl = sanitizeGodfatUrl({
        startingUrl: augmentedUrl,
        banners,
      });
      return {
        label: value.label,
        url: sanitizedUrl,
      };
    });
    setConfigData({ bannerData });
  };

  return (
    <div>
      <Row>
        <TextField
          id="seed-input"
          size="small"
          label="Gacha seed"
          placeholder="123456..."
          variant="outlined"
          value={seed}
          onChange={(event) => {
            setSeed(event.target.value);
          }}
          error={isNaN(Number(seed)) || Number(seed) === 0}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={overrideSeeds}
              onChange={(event) => setOverrideSeeds(event.target.checked)}
            />
          }
          label="Use to override seeds in direct links"
        />
      </Row>
      <Row>
        <Button variant="outlined" onClick={addNewInput}>
          Add new track
        </Button>
      </Row>
      {inputs.map(({ key }) => (
        <UrlInput
          key={key}
          id={key}
          bannerSelectOptions={banners}
          removeSelf={() => removeInput(key)}
          setSelfValue={(value) => setInputValue(key, value)}
        />
      ))}
      <Row>
        <Button variant="contained" onClick={() => onSubmit()}>
          Submit / Update
        </Button>
      </Row>
    </div>
  );
}
