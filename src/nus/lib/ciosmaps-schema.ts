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

const contentWithJustIdSchema = z.strictObject({
  id: byteStringSchema,
});

const contentWithModuleSchema = z.strictObject({
  id: byteStringSchema,
  module: z.string(),
  tmdmoduleid: z.coerce.number(),
});

const contentWithPatchesSchema = z.strictObject({
  id: byteStringSchema,
  patchscount: z.unknown(),
  patch: z.array(
    z.object({
      newbytes: byteListSchema,
      offset: byteStringSchema,
      originalbytes: byteListSchema,
      size: z.coerce.number(),
    }),
  ),
});

const ciosgroupSchema = z.object({
  name: z.string(),
  version: z.string(),
  base: z.array(
    z.object({
      ios: z.coerce.number(),
      version: z.coerce.number(),
      content: z.array(
        z.union([
          contentWithJustIdSchema,
          contentWithModuleSchema,
          contentWithPatchesSchema,
        ]),
      ),
    }),
  ),
});

export const ciosmapsSchema = z.object({
  ciosmaps: z.array(
    z.object({
      ciosgroup: z.array(ciosgroupSchema),
    }),
  ),
});
