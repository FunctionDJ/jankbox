import { XMLParser } from "fast-xml-parser";
import { z } from "zod/v4";

const byteStringSchema = z
  .string()
  .transform((byteString): number => Number.parseInt(byteString, 16));

const byteListSchema = z.string().transform((byteListString): Uint8Array => {
  const bytes = byteListString
    .split(",")
    .map((byteString): number => byteStringSchema.parse(byteString));

  return Uint8Array.from(bytes);
});

const patchSchema = z.object({
  att: z.object({
    newbytes: byteListSchema,
    offset: byteStringSchema,
    originalbytes: byteListSchema,
    size: z.coerce.number(),
  }),
});

const contentWithJustIdSchema = z.strictObject({
  att: z.strictObject({
    id: byteStringSchema,
  }),
});

const contentWithModuleSchema = z.strictObject({
  att: z.strictObject({
    id: byteStringSchema,
    module: z.string(),
    tmdmoduleid: z.coerce.number(),
  }),
});

const contentWithPatchesSchema = z.strictObject({
  att: z
    .strictObject({
      id: byteStringSchema,
      patchscount: z.unknown(),
    })
    // we dont need patchscount, just for identifying the right type of contentXML
    .transform(({ id }) => ({ id })),
  patch: z.array(patchSchema),
});

const contentSchema = z.union([
  contentWithJustIdSchema,
  contentWithModuleSchema,
  contentWithPatchesSchema,
]);

export type ContentXML = z.infer<typeof contentSchema>;

const baseSchema = z.object({
  att: z.object({
    ios: z.coerce.number(),
    version: z.coerce.number(),
  }),
  content: z.array(contentSchema),
});

const ciosgroupSchema = z.object({
  att: z.object({
    name: z.string(),
    version: z.string(),
  }),
  base: z.array(baseSchema),
});

const schema = z.object({
  ciosmaps: z.array(
    z.object({
      ciosgroup: z.array(ciosgroupSchema),
    }),
  ),
});

export const parseXML = (xmlString: string) => {
  const parser = new XMLParser({
    attributeNamePrefix: "",
    attributesGroupName: "att",
    ignoreAttributes: false,
    isArray: (_tagName, _jPath, _isLeafNode, isAttribute): boolean =>
      !isAttribute,
  });

  return schema.parse(parser.parse(xmlString)).ciosmaps;
};
