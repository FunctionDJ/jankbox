import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DriveMenu } from "./DriveMenu";
import { GetVolumeDrive } from "../preload";
import { DriveList } from "./DriveList";
import { driveContext } from "./util/provide-drive";
import { Spinner } from "./components/Spinner";

export const App = () => {
  const drivesQuery = useQuery({
    queryKey: ["drives"],
    retry: false,
    queryFn: () => window.electron.GetVolume(),
    refetchInterval: (q) => (q.state.status === "error" ? false : 2000),
  });

  const [selectedDrive, setSelectedDrive] = useState<
    GetVolumeDrive | undefined
  >(undefined);

  return (
    <main className="min-h-dvh bg-gray-950 p-6 text-white">
      {drivesQuery.isLoading && (
        <div className="h-60 flex items-center justify-center">
          <Spinner className="size-10" />
        </div>
      )}
      {drivesQuery.isError && <span>Error: {drivesQuery.error.message}</span>}
      {drivesQuery.isSuccess &&
        (selectedDrive === undefined ? (
          <DriveList drives={drivesQuery.data} />
        ) : (
          <driveContext.Provider
            value={{
              drive: selectedDrive,
              connected:
                drivesQuery.data.find(
                  (d) => selectedDrive?.UniqueId === d.UniqueId,
                ) !== undefined,
              goToDriveList: () => setSelectedDrive(undefined),
              selectDrive: setSelectedDrive,
            }}
          >
            <DriveMenu />
          </driveContext.Provider>
        ))}
    </main>
  );
};
