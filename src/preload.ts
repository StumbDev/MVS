// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer } = require('electron');
const monaco = require('monaco-editor');

// Update Monaco Editor language
ipcRenderer.on('change-programming-language', (event, language) => {
  monaco.editor.setModelLanguage(editor.getModel(), language);
});
