import { PowerIcon } from "@heroicons/react/16/solid";
import { Button } from "../../components/Button";
import { DisabledReason } from "../../components/DisabledReason";
import { useDriveContext } from "../../util/provide-drive";

export const PriiloaderButton = () => {
  const { connected, drive } = useDriveContext();

  return (
    <Button
      className="w-80 flex flex-col"
      disabled={!connected || drive.FileSystem !== "FAT32"}
    >
      <div className="flex gap-2 items-center justify-center">
        <PowerIcon className="size-[1.5em]" />
        Set up Priiloader
      </div>
      <DisabledReason connected fat32 />
    </Button>
  );
};
