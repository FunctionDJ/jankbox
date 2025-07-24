import { buildCios } from "./functions/build-cios.ts";
import { getLatestIOS } from "./functions/get-latest-ios.ts";
import { iosDatabase } from "./lib/ios-database.ts";

const ios56Wad = await getLatestIOS(iosDatabase.IOS56);

const d2xWad = await buildCios({
  baseIos: iosDatabase.IOS56,
  ciosMapsXMLFile: "C:\\ModMii\\Support\\d2xModules\\ciosmaps.xml",
  ciosModulesFolder: "C:\\ModMii\\Support\\d2xModules",
  ciosName: "d2x-v11-beta3",
  ciosSlot: 249,
  iosVersion: 5661,
  titleVersion: 65535,
  wiiPyHash: "23C6A93D83100D970EE22818723E840DE3C0EB48",
});

console.log("downloaded latest ios56 and downloaded/created d2x-v11 WAD");
console.log(ios56Wad.sha1().toHex());
console.log(d2xWad.sha1().toHex());
