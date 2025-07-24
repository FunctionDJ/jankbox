import { ABW } from "../src/preload/nus/array-buffer-wrapper.ts";
import type { ContentXML } from "./ciosmaps-schema.ts";
import type { ContentRecord } from "./content-record.ts";
import type { Ticket } from "./ticket.ts";

const contentTypeMap: Record<
  "normal" | "hash_tree" | "dlc" | "shared",
  number
> = {
  dlc: 16385,
  hash_tree: 3,
  normal: 1,
  shared: 32769,
};

const assertValidContentType = (int: number) => {
  if (!Object.values(contentTypeMap).includes(int)) {
    throw new Error("invalid content type int");
  }
};

export const createTMD = (buf: ABW, contentParts: ABW[], ticket: Ticket) => {
  const view = new DataView(buf.buf.buffer);

  return {
    signature: buf.read(0x04, 256),
    titleId: buf.read(0x18c, 8).toHex(),
    titleVersion: view.getUint16(0x1dc),
    minorVersion: view.getUint16(0x1e2),
    contentRecords: Array.from({ length: view.getUint16(0x1de) }).map(
      (_val, index): ContentRecord => {
        const slice = buf.read(0x1e4 + 36 * index, 36);

        const view = new DataView(
          slice.buf.buffer,
          slice.buf.byteOffset,
          slice.buf.byteLength,
        );

        const type = view.getUint16(6);
        assertValidContentType(type);

        return {
          id: view.getUint32(0),
          type,
          size: view.getUint32(12),
          hash: slice.slice(16, 36),
          encryptedContent: contentParts[index],
        };
      },
    ),
    dump(): ABW {
      return buf
        .read(0, 4)
        .concatenate(
          this.signature,
          buf.slice(0x04 + 256, 0x184 + 8),
          ABW.fromHex(this.titleId),
          buf.slice(0x194, 0x1d8 + 4),
          ABW.fromInt(2, this.titleVersion),
          ABW.fromInt(2, this.contentRecords.length),
          buf.read(0x1e0, 2),
          ABW.fromInt(2, this.minorVersion),
          ...this.contentRecords.flatMap((record, index) => [
            ABW.fromInt(4, record.id),
            ABW.fromInt(2, index),
            ABW.fromInt(2, record.type),
            ABW.fromInt(8, record.size),
            record.hash,
          ]),
        );
    },
    encryptAndSetContent(
      decryptedContent: ABW,
      index: number,
      contentXML: ContentXML,
      type?: number,
    ) {
      this.contentRecords[index] = {
        encryptedContent: ticket.encrypt(decryptedContent, index),
        hash: decryptedContent.sha1(),
        id: contentXML.att.id,
        size: decryptedContent.buf.byteLength,
        type: type ?? contentTypeMap.normal,
      };
    },
  };
};
