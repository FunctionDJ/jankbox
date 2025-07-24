import { ABW } from "./array-buffer-wrapper.ts";
import { nusCrypto } from "./nus-crypto.ts";

const getCommonKey = (commonKeyIndex: number) => {
  switch (commonKeyIndex) {
    case 1: // korean
      return ABW.fromHex("63b82bb4f4614e2e13f2fefbba4c9b7e");
    case 2: // vWii
      return ABW.fromHex("30bfc76e7c19afbb23163330ced7c28d");
    default: // common / default
      return ABW.fromHex("ebe42a225e8593e448d9c5457381aaf7");
  }
};

export const createTicket = (buf: ABW) => {
  const view = new DataView(buf.buf.buffer);

  if (view.getUint8(0x1bc) !== 0) {
    throw new Error("Only v0 tickets are supported");
  }

  const signatureIssuer = buf.read(0x140, 64);
  const issuerText = new TextDecoder().decode(signatureIssuer.buf);

  if (
    issuerText.includes("Root-CA00000002-XS00000006") ||
    issuerText.includes("Root-CA00000002-XS00000004")
  ) {
    throw new Error("dev tickets not supported yet");
  }

  const titleKeyDecrypted = nusCrypto("decrypt", {
    data: buf.read(0x1bf, 16),
    iv: buf.read(0x1dc, 8),
    key: getCommonKey(view.getUint8(0x1f1)),
  });

  return {
    signature: buf.read(4, 256),
    titleId: buf.read(0x1dc, 8),
    titleVersion: view.getUint16(0x1e6),
    commonKeyIndex: view.getUint8(0x1f1),
    titleKeyDecrypted,
    unknown2: buf.read(0x1f2, 48),
    dump() {
      const titleKeyEncrypted = nusCrypto("encrypt", {
        data: titleKeyDecrypted,
        iv: this.titleId,
        key: getCommonKey(this.commonKeyIndex),
      });

      return buf
        .read(0, 4)
        .concatenate(this.signature)
        .pad(64)
        .concatenate(
          signatureIssuer,
          buf.read(0x180, 61),
          ABW.fromInt(2, 0),
          titleKeyEncrypted,
          ABW.fromInt(1, 0),
          buf.read(0x1d0, 8),
          buf.read(0x1db, 4),
          this.titleId,
          buf.read(0x1e4, 2),
          ABW.fromInt(2, this.titleVersion),
          buf.read(0x1e8, 9),
          ABW.fromInt(1, this.commonKeyIndex),
          this.unknown2,
          buf.read(0x222, 64),
          ABW.fromInt(2, 0),
          buf.slice(0x264, 0x2a4),
        );
    },
  };
};

export type Ticket = ReturnType<typeof createTicket>;
