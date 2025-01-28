const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron/main')
const path = require('node:path')
const fs = require("fs")
const oracledb = require("oracledb")
require("dotenv").config()

async function run(command) {

	console.log(command)
	try {
		const connection = await oracledb.getConnection({
			user: process.env.USR,
			password: process.env.PASSWD,
			connectString: process.env.HOST
		})
		const res = await connection.execute(command)
		console.log(await connection.execute("commit write batch"))
		console.log(res)
		await connection.close()
		return res
	}
	catch (err) {
		console.log(err)
		throw new Error("Oracle error: <br>", command)
	}
}

ipcMain.handle("testConnection",async ()=>{
	try {
		const connection = await oracledb.getConnection({
			user: process.env.USR,
			password: process.env.PASSWD,
			connectString: process.env.HOST
		})
		await connection.close()
	}
	catch (err) {
		throw "Błąd połączenia z bazą danych<br>"+err
	}

})
ipcMain.handle("getZList",async (event,data)=>{
	try {
		var res;
		if(!data){
			res = await run('select * from zyranci_pozyczka')
			return res.rows
		}
		else{
			data.updatez = data.updatez.split('|')
			res = await run(`select * from zyranci_pozyczka where ${data.tab} like '${data.updatez[0]==' '?'':data.updatez[0]}${data.gut}${data.updatez[1]==' '?'':data.updatez[1]}'`)
		}
		return res.rows
	}
	catch (err) {
		throw err
	}

})

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
ipcMain.handle('sendUpdate', async (event, data) =>{
	console.log(data)
	var regex
	try{
		regex = /^[0-9]{11}$/
		if (!regex.exec(data.pesel)) {
			throw ("nie poprawny pesel")
		}
		data.name = (data.name).toLowerCase()
		regex = /^([a-z]|[A-Z])+$/
		if (!regex.exec(data.name)) {
			throw ("nie poprawne imie")
		}
		data.sirname = (data.sirname).toLowerCase()
		regex = /^([a-z]|[A-Z])+$/
		if (!regex.exec(data.sirname)) {
			throw ("nie poprawne nazwisko")
		}
		await run(`update POZYCZKOBIORCY set IMIE = '${data.name}', NAZWISKO = '${data.sirname}', 
		PESEL = '${data.pesel}', STAN_ZATRUDNIENIA_ID = ${data.empl} WHERE ID_POZYCZKOBIORCY = ${data.id}`)
	}
	catch(err){
		throw err
	}
})
ipcMain.handle('search', async (event, type) => {
	let res;
	if (!type) {
		res = await run(`select * from lista_pozyczek`)
		res = res.rows
		return res
	}
	var regex
	type.updatez = type.updatez.split('|')
	switch(type.option){
		case "imie":
			regex = /^([a-z]|[A-Z])+$/
			if (!regex.exec(type.data)) {
				throw ("nie poprawne imie")
			}
		break
		case "pesel":
			regex = /^[0-9]{11}$/
			if (!regex.exec(type.data)) {
				throw ("nie poprawny pesel")
			}
		break
		case "nazwisko":
			regex = /^([a-z]|[A-Z])+$/
			if (!regex.exec(type.data)) {
				throw ("nie poprawne nazwisko")
			}
		break
		default:
		throw("zła opcja")
	}
	var req = `select * from lista_pozyczek where ${type.option} like '${type.updatez[0]==' '?'':type.updatez[0]}${type.gut}${type.updatez[1]==' '?'':type.updatez[1]}'`
	res = await run(req);
	res = res.rows;
	return res;
})
ipcMain.handle('getList', async (event) => {
	let res = await run(`select * from lista_pozyczek`)
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
ipcMain.handle("exportToFile",async ()=> {
	/*	dokument
	 * pozyczkobiorcy
	 *	pozyczka
	 *	zyranci
	 */
	var data = {
		dokument:[],
		pozyczkobiorcy:[],
		pozyczka:[],
		zyranci:[]
	}
	var res;
	var path_ = path.join(__dirname,'/out.json')
	try{
		res = await run('select id_dokumentu,cast(skan as varchar2(500)) from dokument')
		data.dokument = res.rows

		res = await run('select ID_POZYCZKOBIORCY,cast(imie as varchar2(100)),cast(nazwisko as varchar2(100)),cast(pesel as varchar2(100)),WYNIK_KREDYTOWY,wielkosc_skladki,STAN_ZATRUDNIENIA_ID from POZYCZKOBIORCY')
		data.pozyczkobiorcy = res.rows

		res = await run("select ID_POZYCZKI,wysokosc_pozyczki,ILOSC_RAT,rata,to_char(DATA_UMOWY,'YYYY-MM-DD'),RODZAJE_POZYCZEK_ID_POZYCZKI,POZYCZKOBIORCY_ID_POZYCZKOBIORCY,DOKUMENT_ID_DOKUMENTU from POZYCZKA")
		data.pozyczka = res.rows

		res = await run('select ID_ZYRANCI,cast(imie as varchar2(100)),cast(NAZWISKO as varchar2(100)),cast(PESEL as varchar2(100)),POZYCZKA_ID_POZYCZKI from ZYRANCI')
		data.zyranci = res.rows
		fs.writeFile(path_,JSON.stringify(data),(err)=>{
			if(err)
				throw err
		})
		return path_
	}
	catch(err){
		throw err
	}
})
ipcMain.handle("importFromFile",async (event,data)=>{
	try{
		if(data[data.length-1] != '}')
			data = data.split('<')[0]

		console.log(data)
		data = await JSON.parse(data)
		for (x in data.dokument){
			await run(`insert into dokument values(${data.dokument[x][0]},utl_raw.cast_to_raw('${data.dokument[x][1]}'))`)
		}
		for (x in data.pozyczkobiorcy){
			await run(`insert into pozyczkobiorcy values(${data.pozyczkobiorcy[x][0]},'${data.pozyczkobiorcy[x][1]}','${data.pozyczkobiorcy[x][2]}',${data.pozyczkobiorcy[x][5]},'${data.pozyczkobiorcy[x][3]}',${data.pozyczkobiorcy[x][4]},${data.pozyczkobiorcy[x][6]})`)
		}
		for (x in data.pozyczka){
			await run(`insert into pozyczka values(${data.pozyczka[x][0]},${data.pozyczka[x][1]},${data.pozyczka[x][2]},${data.pozyczka[x][3]},to_date('${data.pozyczka[x][4]}','YYYY-MM-DD'),${data.pozyczka[x][5]},${data.pozyczka[x][6]},${data.pozyczka[x][7]})`)
		}
		for (x in data.zyranci){
			await run(`insert into zyranci values(${data.zyranci[x][0]},'${data.zyranci[x][1]}','${data.zyranci[x][2]}','${data.zyranci[x][3]}',${data.zyranci[x][4]})`)
		}
	}
	catch(err){
		throw err
	}
})
ipcMain.handle('getZyrant', async (event, id) => {
	if(id.zyrant){
		try{
			let ret = await run(`
				SELECT ID_ZYRANCI,cast(imie as VARCHAR2(70)),cast(NAZWISKO as VARCHAR2(70)),cast(pesel as VARCHAR2(70)) from ZYRANCI where POZYCZKA_ID_POZYCZKI = ${id.id}`)
			return ret.rows
		}
		catch(err){
			throw err;
		}
	}
	else{
		try{
			let ret = await run(`select rata,ILOSC_RAT,WYSOKOSC_POZYCZKI from POZYCZKA where id_pozyczki = ${id.id}`)
			return ret.rows
		}
		catch(err){
			throw err;
		}
	}
})
ipcMain.handle('submit', async (event, data) => {
	console.log(data)
	let id;
	let regex;
	try {
		switch (data.type) {
			case "delete":
				console.log(await run(`delete from POZYCZKOBIORCY where id_pozyczkobiorcy = ${data.id}`))
				break
			case "pozyczkobiorca":
				regex = /^[0-9]{11}$/
				if (!regex.exec(data.pesel)) {
					throw ("nie poprawny pesel")
				}
				data.name = (data.name).toLowerCase()
				regex = /^([a-z]|[A-Z])+$/
				if (!regex.exec(data.name)) {
					throw ("nie poprawne imie")
				}
				data.sirname = (data.sirname).toLowerCase()
				regex = /^([a-z]|[A-Z])+$/
				if (!regex.exec(data.sirname)) {
					throw ("nie poprawne nazwisko")
				}
				await run('select * from pozyczkobiorcy')
				id = await run("select max(pozyczkobiorcy.ID_POZYCZKOBIORCY) from POZYCZKOBIORCY")
				id = id.rows[0][0] + 1

				await run(`insert into pozyczkobiorcy(id_pozyczkobiorcy,imie,nazwisko,wielkosc_skladki,pesel,wynik_kredytowy,stan_zatrudnienia_id)
			values (${id},'${data.name}','${data.sirname}',${data.moneyz},'${data.pesel}',0,${data.sz})`)

				await run('select * from pozyczkobiorcy')
				break
			case "pozyczka":
				regex = /^[0-9]{11}$/
				if (!regex.exec(data.pesel)) {
					throw ("nie poprawny pesel")
				}
				data.name = (data.name).toLowerCase()
				regex = /^([a-z]|[A-Z])+$/
				if (!regex.exec(data.name)) {
					throw ("nie poprawne imie")
				}
				data.sirname = (data.sirname).toLowerCase()
				regex = /^([a-z]|[A-Z])+$/
				if (!regex.exec(data.sirname)) {
					throw ("nie poprawne nazwisko")
				}
				if (data.amm< 1 || data.raty<1)
					throw ("wysokość pożyczki poza zakresem(1)")
				id = await run("select max(id_dokumentu) from dokument")
				await run(`insert into dokument values(${id.rows[0][0]+1},utl_raw.cast_to_raw('gg'))`)

				id = { doc: id.rows[0][0] + 1, poz: 0 }
				await run(`begin PKG1.dodaj(${data.amm},${data.raty},${id.doc},${data.id}); end;`)
				id = {pozyczka:0,zyrant:0}
				id.pozyczka = await run("select max(id_pozyczki) from pozyczka")
				id.zyrant =  await run("select max(id_zyranci) from zyranci")
				id.pozyczka = Number(id.pozyczka.rows[0][0])
				id.zyrant = Number(id.zyrant.rows[0][0])
				id.zyrant++; 
				console.log(id);
				await run(`insert into zyranci values(${id.zyrant},'${data.name}','${data.sirname}','${data.pesel}',${id.pozyczka})`)
				break
			case "zyrant":
				regex = /^[0-9]{11}$/
				if (!regex.exec(data.pesel)) {
					throw ("nie poprawny pesel")
				}
				data.name = (data.name).toLowerCase()
				regex = /^([a-z]|[A-Z])+$/
				if (!regex.exec(data.zname)) {
					throw ("nie poprawne imie")
				}
				data.sirname = (data.sirname).toLowerCase()
				regex = /^([a-z]|[A-Z])+$/
				if (!regex.exec(data.sirname)) {
					throw ("nie poprawne nazwisko")
				}
				id	=  await run("select max(id_zyranci) from zyranci")
				id = Number(id.rows[0][0])
				id++;
				await run(`insert into zyranci values(${id},'${data.name}','${data.sirname}','${data.pesel}',${data.id})`)
			break
			case "payment":
				ret = await run(`select rata,ILOSC_RAT,WYSOKOSC_POZYCZKI from POZYCZKA where id_pozyczki = ${data.id}`)
				ret = ret.rows
				if(ret[0][2] - ret[0][0] < 0)
					throw "spłacać nie da się zamocno"
				await run(`update POZYCZKA set WYSOKOSC_POZYCZKI = WYSOKOSC_POZYCZKI - rata where ID_POZYCZKI = ${data.id}`)

			break
		}

	}
	catch (e) {
		console.log(data, e.toString())
		throw e.toString()
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
