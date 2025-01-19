const { ipcRenderer } = require("electron");

const selectionBox = document.getElementById("selectionBox");

let isSelecting = false;
let startX, startY;

document.body.addEventListener("mousedown", (e) => {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;

  selectionBox.style.width = "0";
  selectionBox.style.height = "0";
  selectionBox.style.borderWidth = "1px";
  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
});

document.body.addEventListener("mousemove", (e) => {
  if (!isSelecting) return;

  const width = e.clientX - startX;
  const height = e.clientY - startY;

  selectionBox.style.width = `${Math.abs(width)}px`;
  selectionBox.style.height = `${Math.abs(height)}px`;

  if (width < 0) {
    selectionBox.style.left = `${e.clientX}px`;
  } else {
    selectionBox.style.left = `${startX}px`;
  }

  if (height < 0) {
    selectionBox.style.top = `${e.clientY}px`;
  } else {
    selectionBox.style.top = `${startY}px`;
  }
});

document.body.addEventListener("mouseup", () => {
  if (isSelecting) {
    isSelecting = false;

    const selectedRegion = {
      x: parseInt(selectionBox.style.left, 10),
      y: parseInt(selectionBox.style.top, 10),
      width: parseInt(selectionBox.style.width, 10),
      height: parseInt(selectionBox.style.height, 10)
    };
    selectionBox.style.width = "0";
    selectionBox.style.height = "0";
    selectionBox.style.borderWidth = "0px";

    ipcRenderer.send("capture", selectedRegion);
  }
});
