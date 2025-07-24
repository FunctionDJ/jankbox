import crypto from "node:crypto";
import fs from "node:fs/promises";

/** ArrayBufferWrapper */
export class ABW {
  constructor(ab?: ArrayBuffer | Uint8Array) {
    this.buf = new Uint8Array(ab ?? []);
  }

  readonly buf = new Uint8Array();

  static async fromFile(filePath: string): Promise<ABW> {
    const nodeBuffer = await fs.readFile(filePath);

    return new ABW(
      nodeBuffer.buffer.slice(
        nodeBuffer.byteOffset,
        nodeBuffer.byteOffset + nodeBuffer.byteLength,
      ),
    );
  }

  static fromInt(length: number, int: number): ABW {
    const buf = new ArrayBuffer(length);
    const view = new DataView(buf);

    if (![8, 4, 2, 1].includes(length)) {
      throw new Error(`Unsupported length ${length} for fromInt`);
    }

    if (length === 8) {
      view.setBigUint64(0, BigInt(int));
    } else if (length === 4) {
      view.setUint32(0, int);
    } else if (length === 2) {
      view.setUint16(0, int);
    } else {
      view.setUint8(0, int);
    }

    return new ABW(buf);
  }

  pad(padding: number): ABW {
    if (padding === 0 || this.buf.byteLength % padding === 0) {
      return this;
    }

    const newBuffer = new Uint8Array(
      this.buf.byteLength + (padding - (this.buf.byteLength % padding)),
    );

    newBuffer.set(new Uint8Array(this.buf));
    return new ABW(newBuffer);
  }

  assertHash(expectedHashHex: string): void {
    const bufHashHexStringAllCaps = this.sha1().toHex().toUpperCase().trim();
    const expectedHashAllCaps = expectedHashHex.toUpperCase().trim();

    if (bufHashHexStringAllCaps !== expectedHashAllCaps) {
      throw new Error(
        `Hashes don't match\nExpected hash: ${expectedHashAllCaps}\nActual buffer hash: ${bufHashHexStringAllCaps}`,
      );
    }
  }

  concatenate(...other: ABW[]): ABW {
    const temp = new Uint8Array(
      [this, ...other].reduce(
        (sum, wrapper): number => sum + wrapper.buf.byteLength,
        0,
      ),
    );

    let offset = 0;

    for (const wrapper of [this, ...other]) {
      temp.set(new Uint8Array(wrapper.buf), offset);
      offset += wrapper.buf.byteLength;
    }

    return new ABW(temp.buffer);
  }

  toHex(): string {
    return [...this.buf]
      .map((decimalByte): string => decimalByte.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  static fromHex(hex: string): ABW {
    return new ABW(
      new Uint8Array(
        Array.from({ length: Math.ceil(hex.length / 2) }).map(
          (_num, index): number =>
            Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16),
        ),
      ),
    );
  }

  includes(needle: Uint8Array): boolean {
    for (
      let haystackIndex = 0;
      haystackIndex <= this.buf.length - needle.length;
      haystackIndex += 1
    ) {
      let found = true;

      for (let needleIndex = 0; needleIndex < needle.length; needleIndex += 1) {
        if (this.buf[haystackIndex + needleIndex] !== needle[needleIndex]) {
          found = false;
          break;
        }
      }

      if (found) {
        return true;
      }
    }

    return false;
  }

  slice(start: number, end?: number): ABW {
    return new ABW(this.buf.slice(start, end));
  }

  read(start: number, length: number): ABW {
    return this.slice(start, start + length);
  }

  sha1(): ABW {
    return new ABW(crypto.createHash("sha1").update(this.buf).digest());
  }
}
