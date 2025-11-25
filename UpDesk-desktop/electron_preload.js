// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    exportarPDF: (filtros) => ipcRenderer.send("gerar-relatorio-pdf", filtros)
});

