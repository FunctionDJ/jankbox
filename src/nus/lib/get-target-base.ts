import { XMLParser } from "fast-xml-parser";
import fs from "node:fs/promises";
import { ciosmapsSchema } from "./ciosmaps-schema.ts";
import type { TMD } from "./tmd.ts";

const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  isArray: (_tagName, _jPath, _isLeafNode, isAttribute) => !isAttribute,
});

export const getTargetBase = async (tmd: TMD, ciosName: string) => {
  const providedBase = Number.parseInt(tmd.titleId.slice(-2), 16);

  const xmlString = await fs.readFile(
    "C:\\ModMii\\Support\\d2xModules\\ciosmaps.xml",
    "utf8",
  );

  const xml = parser.parse(xmlString);
  const { ciosmaps } = ciosmapsSchema.parse(xml);

  const group = ciosmaps[0].ciosgroup.find(
    (group): boolean => group.name === ciosName,
  );

  if (group === undefined) {
    throw new Error("group not found");
  }

  const base = group.base.find((base) => base.ios === providedBase);

  if (base === undefined) {
    throw new Error("base not found");
  }

  if (tmd.titleVersion !== base.version) {
    throw new Error(
      `The provided base (IOS${providedBase} v${tmd.titleVersion})` +
        ` doesn't match the required version (v${base.version})!`,
    );
  }

  return base;
};
