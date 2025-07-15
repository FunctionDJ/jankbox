import { EnvelopeIcon } from "@heroicons/react/16/solid";
import { RefObject, useEffect, useState } from "react";
import { z } from "zod/v4";
import { WiiRegion } from "../../../preload";
import { Button } from "../../components/Button";
import { countryRegionMap } from "./countryRegionMap";
import { useDriveContext } from "../../util/provide-drive";

interface Props {
  dialogRef: RefObject<HTMLDialogElement | null>;
}

export const HBCDialog = ({ dialogRef }: Props) => {
  const [mac, setMac] = useState("");
  const macIsValid = mac.length === 12;
  const [region, setRegion] = useState<WiiRegion>("U");
  const [ipapiLoading, setIpapiLoading] = useState(true);

  useEffect(() => {
    setIpapiLoading(true);

    fetch("https://ipapi.co/json")
      .then((r) => r.json())
      .then((j) => {
        setIpapiLoading(false);
        const { country } = z.object({ country: z.string() }).parse(j);

        if (country in countryRegionMap) {
          setRegion(countryRegionMap[country]);
        }
      });
  }, []);

  const drive = useDriveContext();

  return (
    <dialog
      ref={dialogRef}
      className="text-white m-auto rounded-xl p-4 bg-gray-700
        backdrop:bg-black/65"
    >
      <div className="flex flex-col gap-4">
        <span className="text-xl font-bold">
          Enter Wii MAC address{" "}
          <Button
            onClick={() => dialogRef.current?.close()}
            className="size-8 rounded-full p-0 font-normal"
          >
            X
          </Button>
        </span>
        <input
          className="border rounded-lg font-mono p-2 self-center text-3xl"
          maxLength={12}
          placeholder="AABBCCDDEEFF"
          size={11}
          value={mac}
          onChange={(e) => {
            if (e.currentTarget.value.match(/^[\da-f]*$/i)) {
              setMac(e.currentTarget.value.toUpperCase());
            }
          }}
        />

        <div className="flex gap-3">
          {(["U", "E", "J", "K"] as const).map((r) => (
            <label key={r} className="cursor-pointer">
              <input
                type="radio"
                disabled={ipapiLoading}
                className="cursor-pointer"
                checked={region === r}
                onChange={() => setRegion(r)}
              />{" "}
              4.3{r}
            </label>
          ))}
        </div>
        <Button
          className="flex gap-2 justify-center"
          disabled={!macIsValid}
          onClick={async () => {
            await window.electron.bomb(mac, region, drive.DriveLetter + ":");
            dialogRef.current?.close();
          }}
        >
          <EnvelopeIcon className="size-[1.5em]" />
          Write to SD
        </Button>
      </div>
    </dialog>
  );
};
