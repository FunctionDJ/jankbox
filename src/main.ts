import { BrowserWindow, app } from "electron";
import path from "node:path";

app.on("ready", async () => {
	const win = new BrowserWindow({
		width: 500,
		height: 1000,
		x: 1200,
		y: 0,
		webPreferences: {
			preload: path.resolve(__dirname, "../preload/preload.mjs"),
			nodeIntegration: true,
		},
	});

	win.webContents.openDevTools();
	await win.loadURL(process.env["ELECTRON_RENDERER_URL"]!);
});
