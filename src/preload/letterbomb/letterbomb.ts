import crypto from "node:crypto";
import fs from "node:fs/promises";
import { ouiList } from "./ouiList";
import { WiiRegion } from "../../preload";

const bin = "./src/preload/letterbomb/bin";

/**
 * adapted from https://github.com/fail0verflow/letterbomb/blob/master/app.py
 */
export const letterbomb = async (
  macString: string,
  region: WiiRegion,
  sdPath: string,
) => {
  const match = macString.match(/.{2}/g);

  if (match === null) {
    throw new Error("Invalid mac");
  }

  const macBuf = Buffer.from(match.map((b) => parseInt(b, 16)));

  if (macBuf.equals(Buffer.from([0x00, 0x17, 0xab, 0x99, 0x99, 0x99]))) {
    throw new Error("Dolphin MAC");
  }

  if (
    !ouiList.some((prefix) => macBuf.subarray(0, prefix.length).equals(prefix))
  ) {
    throw new Error("Bad MAC (does not start with prefix from OUI list)");
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const diffMs =
    yesterday.getTime() - new Date("2000-01-01T00:00:00Z").getTime();

  const timestampInSeconds = Math.floor(diffMs / 1000);

  // TODO migrate from node:crypto to web crypto API
  // TODO migrate from node:buffer to ArrayBuffer

  const key = crypto
    .createHash("sha1")
    .update(Buffer.concat([macBuf, Buffer.from([0x75, 0x79, 0x79])]))
    .digest();

  const out = await fs.readFile(`${bin}/template${region}.bin`);
  out.set(key.subarray(0, 8), 0x08);
  out.fill(0, 0xb0, 0xc4);
  out.writeUInt32BE(timestampInSeconds, 0x7c);
  out.write(timestampInSeconds.toString().padStart(10, "0"), 0x80, "ascii");

  crypto
    .createHmac("sha1", key.subarray(8))
    .update(out)
    .digest()
    .copy(out, 0xb0);

  const filePath = [
    sdPath,
    "private/wii/title/HAEA",
    key.subarray(0, 4).toString("hex").toUpperCase(),
    key.subarray(4, 8).toString("hex").toUpperCase(),
    yesterday.getUTCFullYear(),
    yesterday.getUTCMonth().toString().padStart(2, "0"),
    yesterday.getUTCDate().toString().padStart(2, "0"),
    yesterday.getUTCHours().toString().padStart(2, "0"),
    yesterday.getUTCMinutes().toString().padStart(2, "0"),
    "HABA_#1/txt",
  ].join("/");

  try {
    await fs.mkdir(filePath, { recursive: true });
  } catch {}

  const fileName =
    timestampInSeconds.toString(16).toUpperCase().padStart(8, "0") + ".000";

  await Promise.all([
    fs.writeFile(`${filePath}/${fileName}`, out),
    fs.copyFile(`${bin}/hackmii-installer-v1.2.elf`, `${sdPath}/boot.elf`),
  ]);
};
