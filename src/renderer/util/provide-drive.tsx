import { createContext, useContext } from "react";
import { GetVolumeDrive } from "../../preload";

interface DriveContext {
  drive: GetVolumeDrive;
  connected: boolean;
  goToDriveList: () => void;
  selectDrive: (drive: GetVolumeDrive) => void;
}

export const driveContext = createContext<DriveContext | null>(null);

export const useDriveContext = (): DriveContext => {
  const ctx = useContext(driveContext);

  if (ctx === null) {
    throw new Error("useDriveContext used but provided is null");
  }

  return ctx;
};
