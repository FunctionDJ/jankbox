import { fetchNUS } from "./fetch-nus.ts";

export const fetchCertChain = async () => {
  const [cetk, tmd] = await Promise.all([
    // this titleId is system menu, cetk is ticket
    fetchNUS("0000000100000002/cetk"),
    // this version / tmd is 4.3U
    fetchNUS("0000000100000002/tmd.513"),
  ]);

  const certChainNew = cetk
    .slice(0x02_a4 + 768)
    .concatenate(
      tmd.slice(0x03_28, 0x03_28 + 768),
      cetk.slice(0x02_a4, 0x02_a4 + 768),
    );

  certChainNew.assertHash("ace0f15d2a851c383fe4657afc3840d6ffe30ad0");
  return certChainNew;
};
