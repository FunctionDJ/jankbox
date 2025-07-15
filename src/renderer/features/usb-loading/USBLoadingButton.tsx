import { ArrowDownTrayIcon, PowerIcon } from "@heroicons/react/16/solid";
import { Button } from "../../components/Button";
import { DisabledReason } from "../../components/DisabledReason";
import { useDriveContext } from "../../util/provide-drive";

export const USBLoadingButton = () => {
  const { connected, drive } = useDriveContext();

  return (
    <Button
      className="w-80 flex flex-col"
      disabled={!connected || drive.FileSystem !== "FAT32"}
    >
      <div className="flex gap-2 items-center justify-center">
        <ArrowDownTrayIcon className="size-[1.5em]" />
        Install Project+ (USB Loader)
      </div>
      <DisabledReason connected fat32 />
    </Button>
  );
};
