import crypto from "node:crypto";
import fs from "node:fs/promises";
import { ouiList } from "./ouiList";

const bin = "./1-bomb/bin";

/**
 * adapted from https://github.com/fail0verflow/letterbomb/blob/master/app.py
 */
export const bomb = async (
	mac: Buffer,
	region: "U" | "E" | "J" | "K",
	sdPath: string
) => {
	if (mac.equals(Buffer.from([0x00, 0x17, 0xab, 0x99, 0x99, 0x99]))) {
		throw new Error("Dolphin MAC");
	}

	if (
		!ouiList.some((prefix) => mac.subarray(0, prefix.length).equals(prefix))
	) {
		throw new Error("Bad MAC (does not start with prefix from OUI list)");
	}

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	const diffMs =
		yesterday.getTime() - new Date("2000-01-01T00:00:00Z").getTime();

	const timestampInSeconds = Math.floor(diffMs / 1000);

	const key = crypto
		.createHash("sha1")
		.update(Buffer.concat([mac, Buffer.from([0x75, 0x79, 0x79])]))
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
		yesterday.getFullYear(),
		yesterday.getMonth().toString().padStart(2, "0"),
		yesterday.getDate().toString().padStart(2, "0"),
		yesterday.getHours(),
		yesterday.getMinutes(),
		"HABA_#1/txt",
	].join("/");

	await fs.mkdir(filePath, { recursive: true });
	const fileName =
		timestampInSeconds.toString(16).toUpperCase().padStart(8, "0") + ".000";

	await Promise.all([
		fs.writeFile(`${filePath}/${fileName}`, out),
		fs.copyFile(`${bin}/hackmii-installer-v1.2.elf`, `${sdPath}/boot.elf`),
	]);
};
