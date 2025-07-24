import { ABW } from "./array-buffer-wrapper.ts";

interface Signed {
  signature: ABW;
  dump(): ABW;
}

export const fakesign = (obj: Signed, mutationFn: (int: number) => void) => {
  obj.signature = new ABW(new Uint8Array(256));
  let currentInt = 0;
  let testHash = new ABW();

  while (testHash.buf[0] !== 0x00) {
    currentInt += 1;

    mutationFn(currentInt);

    if (currentInt > 65535) {
      throw new Error("object could not be fakesigned (overflow)");
    }

    testHash = obj.dump().slice(0x140).sha1();
  }
};
