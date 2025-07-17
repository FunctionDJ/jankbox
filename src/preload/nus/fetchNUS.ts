import fs from "node:fs/promises";
import path from "node:path";
import { readArrayBuffer } from "./buffer-utils";

export const fetchNUS = async (title: string) => {
  const cache = `./.nuscache/${title}.cb`;

  try {
    return readArrayBuffer(cache);
  } catch {}

  console.log("fetching uncached", title);

  const response = await fetch(
    `http://ccs.cdn.wup.shop.nintendo.net/ccs/download/${title}`,
    {
      headers: { "User-Agent": "wii libnup/1.0" },
    },
  );

  const buffer = await response.arrayBuffer();
  await fs.mkdir(path.dirname(cache), { recursive: true });
  await fs.writeFile(cache, Buffer.from(buffer));
  return buffer;
};
