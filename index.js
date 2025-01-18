const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron/main')
const path = require('node:path')
const fs = require("fs")
const oracledb = require("oracledb")
const { randomInt } = require('node:crypto')
require("dotenv").config()

async function run(command) {
	try {
		const connection = await oracledb.getConnection({
			user: process.env.USR,
			password: process.env.PASSWD,
			connectString: process.env.HOST
		})
		console.log(command)
		const res = await connection.execute(command)
		console.log(await connection.execute("commit write batch"))
		console.log(res)
		connection.close()
		return res
	}
	catch (err) {
		return err
	}
}

function createWindow() {
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

ipcMain.handle('getList', async (event, type) => {
	console.log("a")
	let res = await run(`select cast(pozyczkobiorcy.imie as varchar(60)),cast(pozyczkobiorcy.nazwisko as varchar(60)),cast(pozyczkobiorcy.pesel as varchar(11)),cast(stan_zatrudnienia.nazwa as varchar(60)),pozyczkobiorcy.id_pozyczkobiorcy
from pozyczkobiorcy inner join stan_zatrudnienia on stan_zatrudnienia.id = pozyczkobiorcy.stan_zatrudnienia_id`)
	res = res.rows
	return res
})

ipcMain.handle('getJson', async () => {
	let res = fs.readFileSync(path.join(__dirname, "sites.json"))
	res = JSON.parse(res)
	return res
})

ipcMain.handle('getEmployment', async () => {
	let res = await run("select cast(nazwa as varchar(100)) from stan_zatrudnienia")
	res = res.rows
	return res
})

ipcMain.handle('getSite', async (event, id) => {
	let site = fs.readFileSync(path.join(__dirname, "sites.json"))
	site = JSON.parse(site)
	if (site[id].form == "")
		return null
	let res = fs.readFileSync(path.join(__dirname, `./src/forms/${site[id].form}`), 'utf-8')
	return res
})

ipcMain.handle('submit', async (event, data) => {
	console.log(data)
	let id;
	let regex;
	let err = { code: 0, msg: "" }
	switch (data.type) {
		case "delete":
			console.log(await run(`delete from POZYCZKOBIORCY where id_pozyczkobiorcy = ${data.id}`))
		break
		case "pozyczkobiorca":
			regex = /^[0-9]{11}$/
			if (!regex.exec(data.pesel)) {
				err.msg = "nie poprawny pesel"
				err.code = 1
				return err
			}
			data.name = (data.name).toLowerCase()
			regex = /^([a-z]|[A-Z])+$/
			if (!regex.exec(data.name)) {
				err.msg = "nie poprawne imie"
				err.code = 2
				return err
			}
			data.sirname = (data.sirname).toLowerCase()
			regex = /^([a-z]|[A-Z])+$/
			if (!regex.exec(data.sirname)) {
				err.msg = "nie poprawne nazwisko"
				err.code = 2
				return err
			}
			try {
				await run('select * from pozyczkobiorcy')
				id = await run("select max(pozyczkobiorcy.ID_POZYCZKOBIORCY) from POZYCZKOBIORCY")
				id = id.rows[0][0]+1
				await run(`insert into pozyczkobiorcy(id_pozyczkobiorcy,imie,nazwisko,wielkosc_skladki,pesel,wynik_kredytowy,stan_zatrudnienia_id)
			values (${id},'${data.name}','${data.sirname}',${data.moneyz},'${data.pesel}',0,${data.sz})`)

				await run('select * from pozyczkobiorcy')
			}
			catch (err) {
				err.msg = "oracle error"
				err.code = randomInt()
				return err
			}
			break
		case "pozyczka":
			try{
				id = await run("select max(id_dokumentu) from dokument")
				id = id.rows[0][0]+1
				await run("select * from dokument")

				res = await run(`insert into dokument(id_dokumentu,skan) values(${id},utl_raw.cast_to_raw('${img}'))`)
				await run('insert into pozyczka()')
			}
			catch (err) {
				err.msg = "oracle error"
				err.code = randomInt()
				return err
			}
		break
	}
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
