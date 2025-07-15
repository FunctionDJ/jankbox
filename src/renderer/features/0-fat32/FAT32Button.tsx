import { CircleStackIcon } from "@heroicons/react/16/solid";
import { Button } from "../../components/Button";
import { useDriveContext } from "../../util/provide-drive";
import { DisabledReason } from "../../components/DisabledReason";

export const FAT32Button = () => {
  const { connected, drive, goToDriveList } = useDriveContext();

  return (
    <Button
      disabled={!connected}
      className="w-80 flex flex-col"
      onClick={() => {
        if (drive.DriveLetter !== null) {
          if (
            window.confirm(
              `Are you sure you want to format ${drive.DriveLetter}? This will delete ALL data on this drive!`,
            )
          ) {
            window.electron.format(drive.DriveLetter).then(console.log);
            goToDriveList();
          }
        }
      }}
    >
      <div className="flex gap-2 items-center justify-center">
        <CircleStackIcon className="size-[1.5em]" />
        Format to FAT32
      </div>
      <DisabledReason connected />
    </Button>
  );
};
