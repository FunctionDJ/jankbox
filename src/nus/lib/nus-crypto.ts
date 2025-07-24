import crypto from "node:crypto";
import { ABW } from "./array-buffer-wrapper.ts";

export const nusCrypto = (
  direction: "encrypt" | "decrypt",
  args: {
    iv: ABW;
    key: ABW;
    data: ABW;
  },
) => {
  const cipherFunction =
    direction === "encrypt" ? crypto.createCipheriv : crypto.createDecipheriv;

  const cipher = cipherFunction(
    "aes-128-cbc",
    args.key.buf,
    args.iv.pad(16).buf,
  );

  return new ABW(cipher.update(args.data.pad(16).buf)).concatenate(
    new ABW(cipher.setAutoPadding(false).final()),
  );
};
