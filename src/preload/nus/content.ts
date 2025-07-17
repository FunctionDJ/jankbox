import { pad } from "./buffer-utils.ts";
import { fetchNUS } from "./fetchNUS.ts";

const align64 = (n: number) => (n % 64 === 0 ? n : n + (64 - (n % 64)));

export const getContentSizeForHeader = (tmd: ArrayBuffer) => {
  const view = new DataView(tmd);
  let sum = 0;

  for (let i = 0; i < view.getUint16(0x1de); i++) {
    const partLength = view.getUint32(0x1e4 + 36 * i + 12);
    const isLast = i === view.getUint16(0x1de) - 1;
    sum += isLast ? partLength : align64(partLength);
  }

  return sum;
};

export const getContentPartsForWAD = async (
  tmd: ArrayBuffer,
  titleId: string,
) => {
  // titleId can alternatively be read from 0x18c from tmd (8 bytes)
  const view = new DataView(tmd);

  const parts = [];

  for (let i = 0; i < view.getUint16(0x1de); i++) {
    const contentId = view
      .getUint32(0x1e4 + i * 0x24)
      .toString(16)
      .padStart(8, "0");

    const raw = await fetchNUS(`${titleId}/${contentId}`);
    parts.push(pad(raw, 64));
  }

  return parts;
};
