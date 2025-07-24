import { getContentPartsForWAD } from "../src/preload/nus/content.ts";
import { fetchNUS } from "../src/preload/nus/fetch-nus.ts";
import { iosDatabase } from "../src/preload/nus/ios-database.ts";
import type { Ticket } from "./ticket.ts";
import { createTMD } from "./tmd.ts";
import { getTargetBase } from "./xml.ts";

export const getTmdAndTargetBase = async (ticket: Ticket) => {
  const iosEntry = iosDatabase.IOS56;
  const tmdData = await fetchNUS(`${iosEntry.TID}/tmd.5661`);

  const tmd = createTMD(
    tmdData,
    await getContentPartsForWAD(tmdData, iosEntry.TID),
    ticket,
  );

  const providedBase = Number.parseInt(tmd.titleId.slice(-2), 16);
  const targetBase = await getTargetBase("d2x-v11-beta3", providedBase);
  const baseVersion = targetBase.att.version;

  if (tmd.titleVersion !== baseVersion) {
    throw new Error(
      `The provided base (IOS${providedBase} v${tmd.titleVersion})` +
        ` doesn't match the required version (v${baseVersion})!`,
    );
  }

  return {
    tmd,
    targetBase,
  };
};
