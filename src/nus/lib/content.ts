import type { ABW } from "./array-buffer-wrapper.ts";
import { fetchNUS } from "./fetch-nus.ts";

export const align64 = (num: number) => {
  if (num % 64 === 0) {
    return num;
  }

  return num + (64 - (num % 64));
};

export const getContentSizeForHeader = (tmd: ABW) => {
  const view = new DataView(tmd.buf.buffer);
  let sum = 0;

  for (let index = 0; index < view.getUint16(0x1de); index += 1) {
    const offset = 0x1e4 + 36 * index + 12;
    const partLength = view.getUint32(offset);
    const isLast = index === view.getUint16(0x1de) - 1;

    if (isLast) {
      sum += partLength;
    } else {
      sum += align64(partLength);
    }
  }

  return sum;
};

export const getContentPartsForWAD = async (tmd: ABW, titleId: string) => {
  // titleId can alternatively be read from 0x18c from tmd (8 bytes)
  const view = new DataView(tmd.buf.buffer);

  const partsPromises: Promise<ABW>[] = [];

  for (let index = 0; index < view.getUint16(0x01_de); index += 1) {
    const contentId = view
      .getUint32(0x01_e4 + index * 0x24)
      .toString(16)
      .padStart(8, "0");

    // TODO i think i actually need to fetch /contentid/iosVersion or something
    partsPromises.push(fetchNUS(`${titleId}/${contentId}`));
  }

  const parts = await Promise.all(partsPromises);
  return parts.map((abw): ABW => abw.pad(64));
};
