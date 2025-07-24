import { ABW } from "./array-buffer-wrapper.ts";
import { fetchCertChain } from "./cert-chain.ts";
import { align64 } from "./content.ts";
import { nusCrypto } from "./nus-crypto.ts";
import type { Ticket } from "./ticket.ts";
import type { TMD } from "./tmd.ts";

export const createWad = async (tmd: TMD, ticket: Ticket) => {
  const certChain = await fetchCertChain();
  const tmdData = tmd.dump();

  const contentSizeForHeader = ABW.fromInt(
    4,
    tmd.contentRecords.reduce((prev, record, index) => {
      if (index === tmd.contentRecords.length - 1) {
        return prev + record.content.buf.byteLength;
      }

      return align64(prev + record.content.buf.byteLength);
    }, 0),
  );

  const wadHeader = ABW.fromInt(4, 0x20)
    .concatenate(
      new ABW(new TextEncoder().encode("Is")),
      ABW.fromInt(2, 0),
      ABW.fromInt(4, certChain.buf.byteLength),
      ABW.fromInt(4, 0),
      ABW.fromInt(4, certChain.slice(0, 0x2a4).buf.byteLength),
      ABW.fromInt(4, tmdData.buf.byteLength),
      contentSizeForHeader,
      ABW.fromInt(4, 0),
    )
    .pad(64);

  const encryptedContents = tmd.contentRecords.map((record, index) =>
    nusCrypto("encrypt", {
      data: record.content,
      iv: ABW.fromInt(2, index),
      key: ticket.titleKeyDecrypted,
    }).pad(64),
  );

  return wadHeader.concatenate(
    certChain,
    ticket.dump().pad(64),
    tmdData.pad(64),
    ...encryptedContents,
  );
};
