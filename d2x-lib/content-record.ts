import type { ABW } from "../src/preload/nus/array-buffer-wrapper.ts";

export interface ContentRecord {
  id: number;
  type: number;
  size: number;
  hash: ABW;
  encryptedContent: ABW;
}
