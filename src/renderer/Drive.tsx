import usbSvg from "./assets/usb-svgrepo-com.svg";
import { bytesToH } from "./util/human-readable-size";
import { useDriveContext } from "./util/provide-drive";

interface Props {
  navigates?: boolean;
}

export const Drive = ({ navigates }: Props) => {
  const { drive, connected, selectDrive } = useDriveContext();

  const inner = (
    <>
      <img
        src={usbSvg}
        className={`inline aspect-square h-10
          ${!connected ? "filter-[brightness(0.7)]" : ""}`}
      />
      <div className="grow">
        <div className="flex h-6 justify-between">
          <p>
            {drive.FileSystemLabel}{" "}
            {drive.DriveLetter && ` (${drive.DriveLetter}:)`}
          </p>
          <p>
            {drive.FileSystem} - {bytesToH(drive.AllocationUnitSize)}
          </p>
        </div>
        <div
          className={`h-4 border-1 border-neutral-300
            ${!connected ? "bg-neutral-500" : "bg-white"}`}
        >
          <div
            className="h-full bg-blue-500"
            style={{
              width:
                ((drive.Size - drive.SizeRemaining) / drive.Size) * 100 + "%",
            }}
          ></div>
        </div>
        <p>
          {bytesToH(drive.SizeRemaining)} free of {bytesToH(drive.Size)}
        </p>
      </div>
    </>
  );

  const classNames = `
    flex w-100 items-center gap-2 rounded border-2
    border-transparent bg-gray-800 px-3 text-left
    ${!connected ? "text-neutral-500" : ""}  
  `;

  if (navigates) {
    return (
      <button
        onClick={() => selectDrive(drive)}
        className={`${classNames} cursor-pointer hover:border-white
          transition-all hover:scale-105`}
        disabled={!connected}
      >
        {inner}
      </button>
    );
  } else {
    return <div className={classNames}>{inner}</div>;
  }
};
