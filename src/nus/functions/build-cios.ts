import { ABW } from "../lib/array-buffer-wrapper.ts";
import { contentTypes } from "../lib/content-types.ts";
import { createWad } from "../lib/create-wad.ts";
import { fakesign } from "../lib/fakesign.ts";
import { fetchNUS } from "../lib/fetch-nus.ts";
import { getTargetBase } from "../lib/get-target-base.ts";
import type { IOSEntry } from "../lib/ios-database.ts";
import { createTicket } from "../lib/ticket.ts";
import { createTMD } from "../lib/tmd.ts";
import path from "node:path";

export const buildCios = async (params: {
  baseIos: IOSEntry;
  iosVersion: number;
  ciosMapsXMLFile: string;
  ciosName: string;
  ciosModulesFolder: string;
  titleVersion: number;
  ciosSlot: number;
  wiiPyHash: string;
}) => {
  const ticket = createTicket(await fetchNUS(`${params.baseIos.TID}/cetk`));

  const tmd = await createTMD(
    await fetchNUS(`${params.baseIos.TID}/tmd.${params.iosVersion}`),
    params.baseIos,
    ticket,
  );

  const targetBase = await getTargetBase(
    params.ciosMapsXMLFile,
    tmd,
    params.ciosName,
  );

  for (const contentXML of targetBase.content) {
    if (!("patch" in contentXML)) {
      if (!("module" in contentXML)) {
        continue;
      }

      const content = await ABW.fromFile(
        path.join(params.ciosModulesFolder, `${contentXML.module}.app`),
      );

      if (contentXML.tmdmoduleid === -1) {
        tmd.contentRecords.push({
          content,
          id: contentXML.id,
          type: contentTypes.normal,
        });
        continue;
      }

      const oldRecord = tmd.contentRecords[contentXML.tmdmoduleid];

      tmd.contentRecords[contentXML.tmdmoduleid] = {
        content,
        id: contentXML.id,
        type: contentTypes.normal,
      };

      if (tmd.contentRecords.some((record) => record.id === oldRecord.id)) {
        throw new Error("cant add content, cid already exists");
      }

      tmd.contentRecords.push(oldRecord);

      continue;
    }

    const index = tmd.contentRecords.findIndex(
      (record) => record.id === contentXML.id,
    );

    const record = tmd.contentRecords[index];

    for (const patch of contentXML.patch) {
      // Sanity check
      if (!record.content.includes(patch.originalbytes)) {
        throw new Error(
          "Found mismatching original bytes while trying to apply patch",
        );
      }

      record.content.buf.set(patch.newbytes, patch.offset);
    }

    tmd.contentRecords[index] = {
      content: record.content,
      id: contentXML.id,
      type: contentTypes.normal,
    };
  }

  const newTitleId =
    tmd.titleId.slice(0, -2) +
    params.ciosSlot.toString(16).padStart(2, "0").toUpperCase();

  if (newTitleId.length !== 16) {
    throw new Error("invalid title id, must be 8 bytes");
  }

  tmd.titleId = newTitleId;
  tmd.titleVersion = params.titleVersion;

  fakesign(tmd, (int) => {
    tmd.minorVersion = int;
  });

  ticket.titleId = ABW.fromHex(newTitleId);
  ticket.titleVersion = params.titleVersion;
  ticket.commonKeyIndex = 0;

  fakesign(ticket, (int) => {
    ticket.unknown2 = ABW.fromInt(2, int).concatenate(ticket.unknown2.slice(2));
  });

  const wad = await createWad(tmd, ticket);
  wad.assertHash(params.wiiPyHash);
  return wad;
};
