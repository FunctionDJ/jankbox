import { useDriveContext } from "../util/provide-drive";

interface Props {
  connected?: boolean;
  fat32?: boolean;
  max2GB?: boolean;
}

export const DisabledReason = ({ connected, fat32, max2GB }: Props) => {
  const driveContext = useDriveContext();

  let reasons: string[] = [];

  if (connected && !driveContext.connected) {
    reasons.push("Storage is disconnected");
  }

  if (fat32 && driveContext.drive.FileSystem !== "FAT32") {
    reasons.push("Storage is not FAT32");
  }

  if (max2GB && driveContext.drive.Size >= 5 * (1024 ^ 3)) {
    reasons.push("Storage too large");
  }

  if (reasons.length === 0) {
    return;
  }

  return <em className="font-normal">{reasons.join(", ")}</em>;
};
