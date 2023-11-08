/** @jsx jsx */
import React, { useEffect } from "react";
import {
  BannerSelectOption,
  augmentGodfatUrlWithGlobalConfig,
  sanitizeGodfatUrl,
} from "./utils/godfat";
import UrlInput from "./UrlInput";
import { jsx } from "@emotion/react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { BannerData, ConfigData } from "./Page";
import {
  useStorageLinkedBoolean,
  useStorageLinkedInputs,
  useStorageLinkedNumber,
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
  seed,
  setSeed,
  forceReload,
  mode,
  setMode,
}: {
  banners: BannerSelectOption[];
  setConfigData: (data: ConfigData) => void;
  seed: string;
  setSeed: (seed: string) => void;
  forceReload: number;
  mode: string;
  setMode: (mode: string) => void;
}) {
  const [count, setCount] = useStorageLinkedNumber("count");
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
    const bannerData = inputs.map(({ value }) => {
      const augmentedUrl = augmentGodfatUrlWithGlobalConfig({
        startingUrl: value.url,
        seed,
        count,
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

  useEffect(() => {
    try {
      onSubmit();
    } catch (e) {}
  }, [forceReload]);

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
        <FormControl>
          <InputLabel id="count-select" shrink>
            Count
          </InputLabel>
          <Select
            notched
            native
            size="small"
            labelId="count-select"
            label="Count"
            value={count}
            onChange={(event) => {
              setCount(event.target.value as number);
            }}
          >
            <option key={"100"} value={100}>
              100
            </option>
            <option key={"200"} value={200}>
              200
            </option>
            <option key={"500"} value={500}>
              500
            </option>
            <option key={"999"} value={999}>
              999
            </option>
          </Select>
        </FormControl>
      </Row>
      <Row>
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "1px solid rgba(0, 0, 0, 0.23)",
          }}
        >
          <Typography css={{ color: "rgba(0, 0, 0, 0.6)" }} variant="caption">
            Planning Mode
          </Typography>
          <FormControlLabel
            control={
              <Switch
                css={{ marginLeft: "4px" }}
                checked={mode === "plan"}
                onChange={() => {
                  if (mode === "plan") {
                    setMode("simulate");
                  } else {
                    setMode("plan");
                  }
                }}
              />
            }
            label={`${mode === "plan" ? "ON" : "OFF"}`}
          />
          <Typography css={{ color: "rgba(0, 0, 0, 0.6)" }} variant="caption">
            {mode === "plan" ? (
              <i>
                (clicking <strong>striped</strong> cells will{" "}
                <strong>continue the chain</strong>)
              </i>
            ) : (
              <i>
                (clicking cells will <strong>simulate rolls</strong>)
              </i>
            )}
          </Typography>
        </div>
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
