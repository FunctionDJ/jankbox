import { ABW } from "./array-buffer-wrapper.ts";
import { getContentPartsForWAD } from "./content.ts";
import type { IOSEntry } from "./ios-database.ts";
import { contentTypes } from "./content-types.ts";
import { nusCrypto } from "./nus-crypto.ts";
import type { Ticket } from "./ticket.ts";

export const createTMD = async (
  buf: ABW,
  iosEntry: IOSEntry,
  ticket: Ticket,
) => {
  const view = new DataView(buf.buf.buffer);
  const contentParts = await getContentPartsForWAD(buf, iosEntry.TID);

  const contentRecords = Array.from({ length: view.getUint16(0x1de) }).map(
    (_val, index) => {
      const slice = buf.read(0x1e4 + 36 * index, 36);

      const view = new DataView(
        slice.buf.buffer,
        slice.buf.byteOffset,
        slice.buf.byteLength,
      );

      const type = view.getUint16(6);

      if (!Object.values(contentTypes).includes(type)) {
        throw new Error("invalid content type int");
      }

      const size = view.getUint32(12);
      const hash = slice.slice(16, 36);

      const content = nusCrypto("decrypt", {
        data: contentParts[index],
        iv: ABW.fromInt(2, index),
        key: ticket.titleKeyDecrypted,
      }).slice(0, size);

      content.assertHash(hash.toHex());

      return {
        id: view.getUint32(0),
        type,
        content,
      };
    },
  );

  return {
    signature: buf.read(0x4, 256),
    titleId: buf.read(0x18c, 8).toHex(),
    titleVersion: view.getUint16(0x1dc),
    minorVersion: view.getUint16(0x1e2),
    contentRecords,
    dump() {
      const dumpedRecords = this.contentRecords.flatMap((record, index) => [
        ABW.fromInt(4, record.id),
        ABW.fromInt(2, index),
        ABW.fromInt(2, record.type),
        ABW.fromInt(8, record.content.buf.byteLength),
        record.content.sha1(),
      ]);

      return buf
        .read(0, 4)
        .concatenate(
          this.signature,
          buf.slice(4 + this.signature.buf.byteLength, 0x18c),
          ABW.fromHex(this.titleId),
          buf.slice(0x194, 0x1dc),
          ABW.fromInt(2, this.titleVersion),
          ABW.fromInt(2, this.contentRecords.length),
          buf.read(0x1e0, 2),
          ABW.fromInt(2, this.minorVersion),
          ...dumpedRecords,
        );
    },
  };
};

export type TMD = Awaited<ReturnType<typeof createTMD>>;
