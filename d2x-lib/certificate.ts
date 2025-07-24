import { ABW } from "../src/preload/nus/array-buffer-wrapper.ts";

const certificateTypeMap2 = {
  "00010000": "RSA_4096",
  "00010001": "RSA_2048",
  "00010002": "ECC",
} as const;

const certificateKeyTypeMap = {
  "00000000": "RSA_4096",
  "00000001": "RSA_2048",
  "00000002": "ECC",
} as const;

const getFromObjOrThrow = <Keys extends string, Values>(
  key: string,
  obj: Record<Keys, Values>,
): Values => {
  if (key in obj) {
    return obj[key as Keys];
  }

  throw new Error(`invalid key ${key} for obj`);
};

const certificateLengthMap = {
  ECC: 0x3c,
  RSA_2048: 0x100,
  RSA_4096: 0x200,
} as const;

export const createCertificate = (buf: ABW) => {
  const type = getFromObjOrThrow(buf.read(0, 4).toHex(), certificateTypeMap2);
  const certLength = certificateLengthMap[type];

  const pubKeyType = getFromObjOrThrow(
    buf.read(0x80 + certLength, 0x4).toHex(),
    certificateKeyTypeMap,
  );

  const keyLength = certificateLengthMap[pubKeyType];

  return {
    type,
    signature: buf.read(0, certLength),
    issuer: buf.read(0x40, 64),
    pubKeyType: pubKeyType,
    pubKeyExponent: pubKeyType.startsWith("RSA_") ? buf.read(0xc8, 0x4) : null,
    childName: buf.read(0x84 + certLength, 64),
    pubKeyId: buf.read(0xc4 + certLength, 4),
    pubKeyModulus: buf.read(0xc8, keyLength),
    dump() {
      const match = Object.entries(certificateTypeMap2).find(
        ([_key, value]): boolean => value === this.type,
      );

      if (!Array.isArray(match)) {
        throw new TypeError("couldnt get cert type");
      }

      const typeAndSig = ABW.fromHex(match[0]).concatenate(this.signature);

      const part1 = typeAndSig
        .pad(64)
        .concatenate(
          this.issuer.pad(64),
          ABW.fromInt(4, certificateLengthMap[this.pubKeyType]),
          this.childName.pad(64),
          this.pubKeyId,
          this.pubKeyModulus,
        );

      if (this.pubKeyType.startsWith("RSA_")) {
        if (this.pubKeyExponent === null) {
          throw new Error(
            "inconsistent parsing: pubKeyType is RSA but no pubKeyExponent",
          );
        }

        return part1.concatenate(this.pubKeyExponent).pad(64);
      }

      return part1.pad(64);
    },
  };
};
