import { writeFileSync } from "node:fs";
import { fakeSign } from "./d2x-lib/fakesign.ts";
import { getTmdAndTargetBase } from "./d2x-lib/get-tmd-and-target-base.ts";
import { createTicket } from "./d2x-lib/ticket.ts";
import { ABW } from "./src/preload/nus/array-buffer-wrapper.ts";
import { fetchCertChain } from "./src/preload/nus/cert-chain.ts";
import { align64 } from "./src/preload/nus/content.ts";
import { fetchNUS } from "./src/preload/nus/fetch-nus.ts";
import { iosDatabase } from "./src/preload/nus/ios-database.ts";
import { getWAD } from "./src/preload/nus/wad.ts";

// await getWAD(iosDatabase.IOS56);
const iosEntry = iosDatabase.IOS56;
const ticket = createTicket(await fetchNUS(`${iosEntry.TID}/cetk`));
const { tmd, targetBase } = await getTmdAndTargetBase(ticket);

for (const contentXML of targetBase.content) {
  if (!("patch" in contentXML)) {
    if (!("module" in contentXML.att)) {
      continue;
    }

    const newDecryptedContent = await ABW.fromFile(
      `C:\\ModMii\\Support\\d2xModules\\${contentXML.att.module}.app`,
    );

    if (contentXML.att.tmdmoduleid === -1) {
      tmd.encryptAndSetContent(
        newDecryptedContent,
        tmd.contentRecords.length,
        contentXML,
      );
      continue;
    }

    const oldRecord = tmd.contentRecords[contentXML.att.tmdmoduleid];
    const oldDecryptedContent = ticket.decrypt(
      oldRecord,
      contentXML.att.tmdmoduleid,
    );

    tmd.encryptAndSetContent(
      newDecryptedContent,
      contentXML.att.tmdmoduleid,
      contentXML,
    );

    if (tmd.contentRecords.some((record) => record.id === oldRecord.id)) {
      throw new Error("cant add content, cid already exists");
    }

    // we must re-encrypt the old content because the index has changed and it's the iv for encryption
    tmd.contentRecords.push({
      ...oldRecord,
      encryptedContent: ticket.encrypt(
        oldDecryptedContent,
        tmd.contentRecords.length,
      ),
    });

    continue;
  }

  const index = tmd.contentRecords.findIndex(
    (record) => record.id === contentXML.att.id,
  );

  const record = tmd.contentRecords[index];
  const decryptedContent = ticket.decrypt(record, index);

  for (const patch of contentXML.patch) {
    // Sanity check
    if (!decryptedContent.includes(patch.att.originalbytes)) {
      throw new Error(
        "Found mismatching original bytes while trying to apply patch",
      );
    }

    decryptedContent.buf.set(patch.att.newbytes, patch.att.offset);
  }

  tmd.encryptAndSetContent(decryptedContent, index, contentXML);
}

const newTitleId =
  tmd.titleId.slice(0, -2) + (249).toString(16).padStart(2, "0").toUpperCase();

if (newTitleId.length !== 16) {
  throw new Error("invalid title id, must be 8 bytes");
}

tmd.titleId = newTitleId;
tmd.titleVersion = 65535;

fakeSign(tmd, (int) => {
  tmd.minorVersion = int;
});

ticket.titleId = ABW.fromHex(newTitleId);
ticket.titleVersion = 65535;
ticket.commonKeyIndex = 0;

fakeSign(ticket, (int) => {
  ticket.unknown2 = ABW.fromInt(2, int).concatenate(ticket.unknown2.slice(2));
});

const encryptedContentDataSize = ABW.fromInt(
  4,
  tmd.contentRecords.reduce((prev, record, index) => {
    if (index === tmd.contentRecords.length - 1) {
      return prev + record.size;
    }

    return align64(prev + record.size);
  }, 0),
);

const tmdData = tmd.dump();
const certChain = await fetchCertChain();

const wadHeader = ABW.fromInt(4, 0x20)
  .concatenate(
    new ABW(new TextEncoder().encode("Is")),
    ABW.fromInt(2, 0),
    ABW.fromInt(4, certChain.buf.byteLength),
    ABW.fromInt(4, 0),
    ABW.fromInt(4, certChain.slice(0, 0x2a4).buf.byteLength),
    ABW.fromInt(4, tmdData.buf.byteLength),
    encryptedContentDataSize,
    ABW.fromInt(4, 0),
  )
  .pad(64);

const wad = wadHeader.concatenate(
  certChain,
  ticket.dump().pad(64),
  tmdData.pad(64),
  ...tmd.contentRecords.map((record) => record.encryptedContent.pad(64)),
);

wad.assertHash("23C6A93D83100D970EE22818723E840DE3C0EB48");

// writeFileSync("./d2x.wad", wad.buf);
