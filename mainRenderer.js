const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const captureBtn = document.getElementById("captureButton");
  const chineseText = document.getElementById("chineseText");
  const vietnameseText = document.getElementById("vietnameseText");

  captureBtn.addEventListener("click", () => {
    ipcRenderer.send("change-window", "selection");
  });

  ipcRenderer.on("capture-finish", (event, result) => {
    chineseText.innerText = result.chineseText;
    vietnameseText.innerHTML = result.vietnameseText.replace(/\n/g, "<br/>");
  });
});
