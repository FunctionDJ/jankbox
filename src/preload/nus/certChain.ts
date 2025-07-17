import { fetchNUS } from "./fetchNUS.ts";

export const fetchCertChain = async () => {
  const [cetk, tmd] = await Promise.all([
    // this titleId is system menu, cetk is ticket
    fetchNUS("0000000100000002/cetk").then((b) => new Uint8Array(b)),
    // this version / tmd is 4.3U
    fetchNUS("0000000100000002/tmd.513").then((b) => new Uint8Array(b)),
  ]);

  const part1 = cetk.subarray(0x2a4 + 768);
  const part2 = tmd.subarray(0x328, 0x328 + 768);
  const part3 = cetk.subarray(0x2a4, 0x2a4 + 768);

  const certChain = new Uint8Array(part1.length + part2.length + part3.length);
  certChain.set(part1, 0);
  certChain.set(part2, part1.length);
  certChain.set(part3, part1.length + part2.length);

  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-1", certChain);

  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hashHex !== "ace0f15d2a851c383fe4657afc3840d6ffe30ad0") {
    throw new Error("Hash mismatch");
  }

  return certChain;
};
