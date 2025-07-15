import { DocumentDuplicateIcon } from "@heroicons/react/16/solid";
import { Button } from "../../components/Button";
import { DisabledReason } from "../../components/DisabledReason";
import { useDriveContext } from "../../util/provide-drive";

export const D2xButton = () => {
  const ctx = useDriveContext();

  return (
    <Button
      className="w-80 flex flex-col"
      disabled={!ctx.connected || ctx.drive.FileSystem !== "FAT32"}
    >
      <div className="flex gap-2 items-center justify-center">
        <DocumentDuplicateIcon className="size-[1.5em]" />
        Set up d2x / cIOS
      </div>
      <DisabledReason connected fat32 />
    </Button>
  );
};
