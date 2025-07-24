import { getContentPartsForWAD, getContentSizeForHeader } from "./content.ts";
import { ABW } from "./array-buffer-wrapper.ts";
import type { IOSEntry } from "./ios-database.ts";
import { fetchCertChain } from "./cert-chain.ts";
import { fetchNUS } from "./fetch-nus.ts";

export const getWAD = async (iosEntry: IOSEntry): Promise<ABW> => {
  const tmd = await fetchNUS(`${iosEntry.TID}/tmd`);
  const contentParts = await getContentPartsForWAD(tmd, iosEntry.TID);
  const ticket = await fetchNUS(`${iosEntry.TID}/cetk`);
  const certChain = await fetchCertChain();

  const certlessTmd = tmd.slice(0, tmd.buf.byteLength - 1792);
  const certlessTicket = ticket.slice(0, 0x02_a4);

  const headerSize = ABW.fromInt(4, 32);

  const wadHeader = headerSize.concatenate(
    new ABW(new TextEncoder().encode("Is")), // always "Is"
    new ABW(new Uint8Array(2)), // WAD version, is zero
    ABW.fromInt(4, certChain.buf.byteLength), // cert chain size
    ABW.fromInt(4, 0), // reserved, is zero
    ABW.fromInt(4, certlessTicket.buf.byteLength), // ticket size
    ABW.fromInt(4, certlessTmd.buf.byteLength), // tmd size
    ABW.fromInt(4, getContentSizeForHeader(tmd)), // encrypted content data size
    ABW.fromInt(4, 0), // footer size but it's optional so we just write 0
    new ABW(new Uint8Array(0x20)), // alignment for 0x40 / 64 total length
  );

  const wad = wadHeader.concatenate(
    certChain,
    certlessTicket.pad(64),
    certlessTmd,
    ...contentParts,
  );

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
