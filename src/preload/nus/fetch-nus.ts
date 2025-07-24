import { ABW } from "./array-buffer-wrapper.ts";
import fs from "node:fs/promises";
import path from "node:path";

export const fetchNUS = async (title: string): Promise<ABW> => {
  const cache = `./.nuscache/${title}.cb`;

  try {
    return await ABW.fromFile(cache);
  } catch {
    // assume error means cache miss instead of e.g. permissions error
  }

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
  return new ABW(buffer);
};
