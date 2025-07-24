import { createWad } from "../lib/create-wad.ts";
import { fetchNUS } from "../lib/fetch-nus.ts";
import type { IOSEntry } from "../lib/ios-database.ts";
import { createTicket } from "../lib/ticket.ts";
import { createTMD } from "../lib/tmd.ts";

export const getLatestIOS = async (iosEntry: IOSEntry) => {
  const ticket = createTicket(await fetchNUS(`${iosEntry.TID}/cetk`));

  const tmd = await createTMD(
    await fetchNUS(`${iosEntry.TID}/tmd`),
    iosEntry,
    ticket,
  );

  const wad = await createWad(tmd, ticket);

  if (typeof iosEntry.sha1 === "string") {
    wad.assertHash(iosEntry.sha1);
  } else {
    throw new TypeError(
      "Downloading IOS/WAD without SHA1 hash from e.g. NUSD/NUSGet WAD" +
        " in iosDatabase.ts is currently not allowed for fear of bad/corrupted WAD files",
    );
  }

  return wad;
};
