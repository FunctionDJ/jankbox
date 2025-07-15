import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { FAT32Button } from "./features/0-fat32/FAT32Button";
import { HBCButton } from "./features/1-hbc/HBCButton";
import { D2xButton } from "./features/2-d2x/D2xButton";
import { Button } from "./components/Button";
import { Drive } from "./Drive";
import { HacklessButton } from "./features/hackless/HacklessButton";
import { HomebrewButton } from "./features/homebrew/HomebrewButton";
import { PriiloaderButton } from "./features/priiloader/PriiloaderButton";
import { useDriveContext } from "./util/provide-drive";
import { USBLoadingButton } from "./features/usb-loading/USBLoadingButton";

export const DriveMenu = () => {
  const { goToDriveList } = useDriveContext();

  return (
    <section className="flex items-center flex-col gap-4">
      <div className="flex gap-2 h-10 justify-between items-center w-80">
        <Button className="w-10 h-full p-0" onClick={goToDriveList}>
          <ArrowLeftIcon className="p-1" />
        </Button>
        <span>Selected Drive</span>
        <div className="w-10"></div>
      </div>
      <Drive />
      <hr className="border-gray-700 w-full" />
      <FAT32Button />
      <HBCButton />
      <D2xButton />
      <PriiloaderButton />
      <HacklessButton />
      <HomebrewButton />
      <USBLoadingButton />
    </section>
  );
};
