import {
  app,
  ipcMain,
  desktopCapturer,
  screen,
  BrowserWindow
} from "electron/main";
import { createWorker } from "tesseract.js";
import translate from "translate";

/**
 * @type {BrowserWindow}
 */
let mainWindow;

/**
 * @type {BrowserWindow}
 */
let selectionWindow;

/**
 * @type {Tesseract.Worker}
 */
let worker;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 650,
    autoHideMenuBar: true,
    resizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile("index.html");
};

const createSelectionWindow = () => {
  selectionWindow = new BrowserWindow({
    frame: false,
    show: false,
    fullscreen: true,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  selectionWindow.loadFile("selection.html");
};

app.whenReady().then(() => {
  createMainWindow();
  createSelectionWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createSelectionWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("change-window", (event, windowName) => {
  if (windowName === "selection") {
    selectionWindow.show();
    mainWindow.hide();
    return;
  }

  selectionWindow.hide();
  mainWindow.show();
});

ipcMain.on("capture", async (event, selectedRegion) => {
  try {
    const primaryScreen = screen.getPrimaryDisplay();

    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: primaryScreen.size
    });

    const img = sources[0].thumbnail.crop(selectedRegion);

    if (!worker) {
      worker = await createWorker("chi_sim");
    }

    const ret = await worker.recognize(img.toPNG());
    const chineseText = ret.data.text;
    const vietnameseText = await translate(chineseText, {
      from: "zh",
      to: "vi"
    });

    mainWindow.webContents.send("capture-finish", {
      chineseText,
      vietnameseText
    });

    selectionWindow.hide();
    mainWindow.show();
  } catch (err) {}
});
