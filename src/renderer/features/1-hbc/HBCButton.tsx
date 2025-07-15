import { EnvelopeIcon } from "@heroicons/react/16/solid";
import { useRef } from "react";
import { Button } from "../../components/Button";
import { useDriveContext } from "../../util/provide-drive";
import { HBCDialog } from "./HBCDialog";
import { DisabledReason } from "../../components/DisabledReason";

export const HBCButton = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const { connected, drive } = useDriveContext();

  return (
    <>
      <HBCDialog dialogRef={ref} />
      <Button
        disabled={!connected || drive.FileSystem !== "FAT32"}
        onClick={() => ref.current?.showModal()}
        className="w-80 flex flex-col"
      >
        <div className="flex gap-2 items-center justify-center">
          <EnvelopeIcon className="size-[1.5em]" />
          Set up HBC (LetterBomb)
        </div>
        <DisabledReason connected fat32 />
      </Button>
    </>
  );
};
