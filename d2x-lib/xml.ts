import fs from "node:fs/promises";
import { parseXML } from "./ciosmaps-schema.ts";

export const getTargetBase = async (ciosVer: string, providedBase: number) => {
  const ciosMaps = parseXML(
    await fs.readFile(
      String.raw`C:\ModMii\Support\d2xModules\ciosmaps.xml`,
      "utf8",
    ),
  );

  const group = ciosMaps[0].ciosgroup.find(
    (group): boolean => group.att.name === ciosVer,
  );

  if (group === undefined) {
    throw new Error("group not found");
  }

  const base = group.base.find((base) => base.att.ios === providedBase);

  if (base === undefined) {
    throw new Error("base not found");
  }

  return base;
};
