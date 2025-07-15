import { GetVolumeDrive } from "../preload";
import { Drive } from "./Drive";

interface Props {
  drives: GetVolumeDrive[];
}

export const DriveList = ({ drives }: Props) => (
  <section className="flex flex-col items-center gap-2">
    {drives
      .filter((d) => d.DriveType === "Removable")
      .toSorted((a, b) => {
        if (a.DriveLetter === null || b.DriveLetter === null) {
          return 1;
        }
        return a.DriveLetter > b.DriveLetter ? -1 : 1;
      })
      .map((drive) => (
        <Drive key={drive.UniqueId} navigates />
      ))}
  </section>
);
