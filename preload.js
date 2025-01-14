const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('darkModez', {
	toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
	system: () => ipcRenderer.invoke('dark-mode:system'),
})
contextBridge.exposeInMainWorld('send', {
	send: (data) => ipcRenderer.invoke('submit', data),
})
contextBridge.exposeInMainWorld('get', {
	selections: () => ipcRenderer.invoke("getJson"),
	site: (id) => ipcRenderer.invoke("getSite", id),
	employment: () => ipcRenderer.invoke("getEmployment"),
	list: (type) => ipcRenderer.invoke("getList",type),
})
