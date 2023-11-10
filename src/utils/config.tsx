import { useState } from "react";
import { BannerData } from "../Page";

const DEFAULTS = {
  seed: "",
  lastCatId: 0,
  count: 100,
  inputKeys: [],
  mode: "simulate",
};

const URL_INPUT_DEFAULTS = {
  inputType: "select",
  selectedBanner: "",
  numFutureUbers: 0,
  inputUrl: "",
  customName: "",
};

function useStorageLinked<T>({
  key,
  ser,
  des,
}: {
  key: string;
  ser: (value: T) => string;
  des: (value: string) => T;
}): [T, (value: T) => void] {
  let initialValue = (DEFAULTS[key as keyof typeof DEFAULTS] ??
    URL_INPUT_DEFAULTS[key.split(":")[1] as keyof typeof URL_INPUT_DEFAULTS] ??
    "") as T;
  if (sessionStorage.getItem(key) !== null) {
    initialValue = des(sessionStorage.getItem(key) as string);
  }
  const [value, setValue] = useState<T>(initialValue);
  const linkedSetValue = (value: T) => {
    sessionStorage.setItem(key, ser(value));
    setValue(value);
  };
  return [value, linkedSetValue];
}

export const useStorageLinkedString = (key: string) =>
  useStorageLinked<string>({
    key,
    ser: (str) => str,
    des: (str) => str,
  });

export const useStorageLinkedBoolean = (key: string) =>
  useStorageLinked<boolean>({
    key,
    ser: (bool) => bool.toString(),
    des: (bool) => bool === "true",
  });

export const useStorageLinkedNumber = (key: string) =>
  useStorageLinked<number>({
    key,
    ser: (num) => num.toString(),
    des: (num) => parseInt(num, 10),
  });

type UrlInputData = {
  key: string;
  value: BannerData;
};
// We only store the keys of the inputs in sessionStorage, the rest of the data is generated at runtime
export const useStorageLinkedInputs = (
  key: string
): [
  UrlInputData[],
  (setter: (prevInputs: UrlInputData[]) => UrlInputData[]) => void
] => {
  let initialValue = DEFAULTS[key as keyof typeof DEFAULTS] ?? [];
  if (sessionStorage.getItem(key) !== null) {
    initialValue = JSON.parse(sessionStorage.getItem(key) as string).map(
      (key: string) => ({
        key,
        value: { label: "", url: "" },
      })
    );
  }
  const [inputs, setInputs] = useState<UrlInputData[]>(
    initialValue as UrlInputData[]
  );
  const linkedSetInputs = (
    setter: (prevInputs: UrlInputData[]) => UrlInputData[]
  ) => {
    const storageLinkedSetter = (prevInputs: UrlInputData[]) => {
      const newInputs = setter(prevInputs);
      sessionStorage.setItem(
        key,
        JSON.stringify(newInputs.map(({ key }) => key))
      );
      return newInputs;
    };
    setInputs(storageLinkedSetter);
  };
  return [inputs, linkedSetInputs];
};
