const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('darkModez', {
	toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
	system: () => ipcRenderer.invoke('dark-mode:system'),
})
contextBridge.exposeInMainWorld('send', {
	send: (data) => ipcRenderer.invoke('submit', data),
	search: (type) => ipcRenderer.invoke("search", type)
})
contextBridge.exposeInMainWorld('get', {
	selections: () => ipcRenderer.invoke("getJson"),
	site: (id) => ipcRenderer.invoke("getSite", id),
	employment: () => ipcRenderer.invoke("getEmployment"),
	list: () => ipcRenderer.invoke("getList"),
})
contextBridge.exposeInMainWorld('file', {
	export: () => ipcRenderer.invoke("exportToFile"),
	import: (data) => ipcRenderer.invoke("importFromFile",data),
})
