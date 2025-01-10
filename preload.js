const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('darkModez', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})
contextBridge.exposeInMainWorld('send',{
	send: (data)=> ipcRenderer.send('submit',data),
})
