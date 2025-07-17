import {
  assertHash,
  concatArrayBuffers,
  intToBuf,
  pad,
} from "./buffer-utils.ts";
import { fetchCertChain } from "./certChain.ts";
import { getContentPartsForWAD, getContentSizeForHeader } from "./content.ts";
import { fetchNUS } from "./fetchNUS.ts";
import type { IOSEntry } from "./iosDatabase.ts";

const getTmdAndContentParts = async (titleId: string) => {
  const tmd = await fetchNUS(`${titleId}/tmd`);

  return {
    tmd,
    contentParts: await getContentPartsForWAD(tmd, titleId),
  };
};

export const getWAD = async (iosEntry: IOSEntry) => {
  const [{ tmd, contentParts }, ticket, certChain] = await Promise.all([
    getTmdAndContentParts(iosEntry.TID),
    fetchNUS(`${iosEntry.TID}/cetk`),
    fetchCertChain(),
  ]);

  const certlessTmd = tmd.slice(0, tmd.byteLength - 1792);
  const certlessTicket = ticket.slice(0, 0x2a4);

  const wadHeaderParts = [
    intToBuf(4, 32), // header size (set to 0x20 / 32)
    new TextEncoder().encode("Is"), // always "Is"
    new Uint8Array(2), // WAD version, is zero
    intToBuf(4, certChain.length), // cert chain size
    intToBuf(4, 0), // reserved, is zero
    intToBuf(4, certlessTicket.byteLength), // ticket size
    intToBuf(4, certlessTmd.byteLength), // tmd size
    intToBuf(4, getContentSizeForHeader(tmd)), // encrypted content data size
    intToBuf(4, 0), // footer size but it's optional so we just write 0
    new Uint8Array(0x20), // alignment for 0x40 / 64 total length
  ];

  const wad = concatArrayBuffers([
    ...wadHeaderParts,
    certChain,
    pad(certlessTicket, 64),
    certlessTmd,
    ...contentParts,
  ]);

  if (iosEntry.sha1 !== undefined) {
    assertHash(wad, iosEntry.sha1);
  } else {
    throw new Error(
      "Downloading IOS/WAD without SHA1 hash from e.g. NUSD/NUSGet WAD" +
        " in iosDatabase.ts is currently not allowed for fear of bad/corrupted WAD files",
    );
  }

  return wad;
};
