const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron/main')
const path = require('node:path')
const fs = require("fs")

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
	win.getNativeWindowHandle()
  win.loadFile('index.html')
}

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('getJson',async ()=>{
	let res = fs.readFileSync(path.join(__dirname,"sites.json"))
	res = JSON.parse(res)
	return res
})

ipcMain.handle('getSite',async (event,id)=>{
	let site = fs.readFileSync(path.join(__dirname,"sites.json"))
	site = JSON.parse(site)
	if(site[id].form == "")
		return null
	let res = fs.readFileSync(path.join(__dirname,`./src/forms/${site[id].form}`),'utf-8')
	return res
})

ipcMain.handle('submit', (event,data) => {
	console.log(data)
})

app.whenReady().then(() => {
  createWindow()
  nativeTheme.themeSource = 'system'
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
/*
 * udzielenie porzyczki
 * spłacenie raty
 * pozozostałe raty
 * 
 *
 *
 */
