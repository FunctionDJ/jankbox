import fs from "node:fs/promises";

const encodeHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

export const concatArrayBuffers = (buffers: ArrayBuffer[]) => {
  const temp = new Uint8Array(
    buffers.reduce((sum, b) => sum + b.byteLength, 0),
  );

  let offset = 0;

  for (const b of buffers) {
    temp.set(new Uint8Array(b), offset);
    offset += b.byteLength;
  }

  return temp.buffer;
};

export const assertHash = async (buf: ArrayBuffer, expectedHashHex: string) => {
  const expectedHashAllCaps = expectedHashHex.toUpperCase().trim();
  const bufHash = await globalThis.crypto.subtle.digest("SHA-1", buf);
  const bufHashHexStringAllCaps = encodeHex(bufHash).toUpperCase().trim();

  if (bufHashHexStringAllCaps !== expectedHashAllCaps) {
    throw new Error(
      `Hashes don't match\nExpected hash: ${expectedHashAllCaps}\nActual buffer hash: ${bufHashHexStringAllCaps}`,
    );
  }
};

export function pad(buf: ArrayBuffer, padding: number) {
  if (buf.byteLength % padding === 0) {
    return buf;
  }

  const newBuffer = new Uint8Array(
    buf.byteLength + (padding - (buf.byteLength % padding)),
  );

  if (newBuffer.byteLength % padding !== 0) {
    throw new Error("bad padding");
  }

  newBuffer.set(new Uint8Array(buf));
  return newBuffer.buffer;
}

export const intToBuf = (length: 4 | 2 | 1, int: number) => {
  const buf = new ArrayBuffer(length);
  const view = new DataView(buf);

  if (length === 4) {
    view.setUint32(0, int);
  } else if (length === 2) {
    view.setUint16(0, int);
  } else {
    view.setUint8(0, int);
  }

  return buf;
};

export const readArrayBuffer = async (filePath: string) => {
  const nodeBuffer = await fs.readFile(filePath);
  return nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength,
  );
};
