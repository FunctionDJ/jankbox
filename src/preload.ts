import { contextBridge } from "electron";
import childProcess from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";
import z from "zod/v4";
import { letterbomb } from "./preload/letterbomb/letterbomb";

const execAsync = promisify(childProcess.exec);

const posh = async (cmd: string) =>
  execAsync(`powershell -Command "${cmd}"`, {
    encoding: "utf-8",
  });

const poshUAC = (cmd: string) =>
  posh(`Start-Process powershell -Verb RunAs -ArgumentList '${cmd}'`);

const getVolumeFileSystemSchema = z.enum(["NTFS", "FAT", "FAT32"]);

export type GetVolumeFileSystem = z.infer<typeof getVolumeFileSystemSchema>;

const getVolumeDriveSchema = z.object({
  DriveType: z.enum(["Fixed", "Removable"]),
  HealthStatus: z.enum(["Healthy"]),
  UniqueId: z.string(),
  DriveLetter: z.string().nullable(),
  FileSystem: getVolumeFileSystemSchema,
  FileSystemLabel: z.string(),
  Size: z.int(),
  SizeRemaining: z.int(),
  AllocationUnitSize: z.int(),
});

export type GetVolumeDrive = z.infer<typeof getVolumeDriveSchema>;

export type WiiRegion = "E" | "U" | "K" | "J";

const API = {
  os: () => ({
    release: os.release(),
    os: os.version(),
    platform: os.platform(),
  }),
  GetVolume: async () => {
    const result = await posh("Get-Volume | ConvertTo-Json");
    return z.array(getVolumeDriveSchema).parse(JSON.parse(result.stdout));
  },
  format: async (driveLetter: string) =>
    poshUAC(
      [
        "Format-Volume",
        `-DriveLetter ${driveLetter}`,
        "-FileSystem FAT32",
        "-AllocationUnitSize 32768",
        "-NewFileSystemLabel",
        "CRIMEBOX_SD",
      ].join(" "),
    ),
  bomb: letterbomb,
};

const apiKey = "electron" as const;

declare global {
  interface Window {
    [apiKey]: typeof API;
  }
}

contextBridge.exposeInMainWorld(apiKey, API);
