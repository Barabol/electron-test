var selected = 0;

init()
async function theme() {
	const isDarkMode = await window.darkModez.toggle()
	document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
}

async function init() {
	const data = await window.get.selections(12)
	let content = "<tr>"
	for (x in data) {
		content += `<td><input type="button" id="option-${x}" class="unselected" value = "${data[x].name}" onclick="setOption(${x})"></td>`
		console.log(data[x])
	}
	content += "<td><button id=\"scheme\"><img src=\"src/img/theme.png\" width=\"13px\" height=\"13px\" onclick=\"theme()\"></button></td></tr>"
	document.getElementById("options").innerHTML = content
	setOption(0)
}
async function deleteItem(id_) {
	await window.send.send({ type: "delete", id: id_ })
	setOption(selected)
}
async function setOption(id) {
	document.getElementById(`option-${selected}`).disabled = false
	document.getElementById(`option-${selected}`).className = "unselected"
	document.getElementById(`option-${id}`).disabled = true
	document.getElementById(`option-${id}`).className = "selected"
	selected = id
	const data = await window.get.site(id)

	if (!data) {
		document.getElementById("content").innerHTML = "not found"
		return
	}
	document.getElementById("content").innerHTML = data
	switch (id) {
		case 0:
			search()
		break
		case 2:
			const a = await window.get.employment()
			for (x in a)
				document.getElementById('employment').innerHTML += `<option value = ${x}>${a[x]}</option>`
			break
		case 4:
			{
			const b = await window.get.list()
			//const b = ['a']
			document.getElementById('mainTable').innerHTML += `<tr><td><b>Imie</b></td><td><b>Nazwisko</b>
			</td><td><b>Pesel</b></td><td><b>Stan zatrudnienia</b></td><td><b>Edytój</b></td><td><b>Usuń</b></td></tr>`
			for (x in b) {
				document.getElementById('mainTable').innerHTML += `
				<tr><td id = 'name-${b[x][4]}'>${b[x][0]}</td>
				<td id = 'sirname-${b[x][4]}'>${b[x][1]}</td>
				<td id = 'pesel-${b[x][4]}'>${b[x][2]}</td>
				<td id = 'empl-${b[x][4]}'>${b[x][3]}</td>
				<td><input class='e' type="button" id = 'edit-${b[x][4]}' onclick="editItem(${b[x][4]})" value="E"></td>
				<td><input type="button" onclick="deleteItem(${b[x][4]})" value="X"></td>
				</tr>`
			}
			}
			break
		case 5:
			{
			const b = await window.get.list()
			//const b = ['a']
			document.getElementById('mainTable').innerHTML = `<tr><td><b>Imie</b></td><td><b>Nazwisko</b>
			</td><td><b>Pesel</b></td><td><b>Stan zatrudnienia</b></td><td><b>Edytój</b></td><td><b>Usuń</b></td></tr>`
			for (x in b) {
				document.getElementById('mainTable').innerHTML += `
				<tr><td id = 'name-${b[x][4]}'>${b[x][0]}</td>
				<td id = 'sirname-${b[x][4]}'>${b[x][1]}</td>
				<td id = 'pesel-${b[x][4]}'>${b[x][2]}</td>
				<td id = 'empl-${b[x][4]}'>${b[x][3]}</td>
				<td><input class='e' type="button" id = 'edit-${b[x][4]}' onclick="editItem(${b[x][4]})" value="E"></td>
				<td><input type="button" onclick="deleteItem(${b[x][4]})" value="X"></td>
				</tr>`
			}
			}
			break
	}
}
async function editItem(id){
	let cClass = document.getElementById(`edit-${id}`).className
	console.log(id,cClass)
	let data = {
		id: '',
		name:'',
		sirname:'',
		pesel:'',
		empl:''
	}
	if(cClass == 'e'){
		document.getElementById(`edit-${id}`).className='s'
		data.name = document.getElementById(`name-${id}`).innerHTML
		data.sirname= document.getElementById(`sirname-${id}`).innerHTML
		data.pesel = document.getElementById(`pesel-${id}`).innerHTML
		data.empl = document.getElementById(`empl-${id}`).innerHTML

		const a = await window.get.employment()
		let doc = `<select id="empl-${id}-e">`

		for (x in a)
			doc += `<option value = ${x} id = 'opt-${x}'>${a[x]}</option>`
		doc += '</select>' 

		document.getElementById(`empl-${id}`).innerHTML=doc

		document.getElementById(`name-${id}`).innerHTML = `<input type='text' id='name-${id}-e' value = ${data.name} class='btnOpt'>`
		document.getElementById(`sirname-${id}`).innerHTML = `<input type='text' id='sirname-${id}-e' value = ${data.sirname} class='btnOpt'>`
		document.getElementById(`pesel-${id}`).innerHTML = `<input type='number' id='pesel-${id}-e' value = ${data.pesel} class='btnOpt'>`
		
		console.log(data)
	}
	else{
		data.name = document.getElementById(`name-${id}-e`).value
		data.sirname= document.getElementById(`sirname-${id}-e`).value
		data.pesel = document.getElementById(`pesel-${id}-e`).value
		data.empl = document.getElementById(`empl-${id}-e`).value
		data.id = id
		try{
			await window.send.update(data)
			showMsg(false,"uaktualniono")
			document.getElementById(`name-${id}`).innerHTML = data.name
			document.getElementById(`sirname-${id}`).innerHTML = data.sirname
			document.getElementById(`pesel-${id}`).innerHTML = data.pesel
			document.getElementById(`empl-${id}`).innerHTML = document.getElementById(`opt-${data.empl}`).innerHTML
			document.getElementById(`edit-${id}`).className='e'
			console.log(data)
		}
		catch(err){
			showMsg(true,err)
		}
	}
}
var file = ""
async function setFile(t) {
	function changeCFile(content) {
		file = content
	}
	reader = new FileReader()
	await reader.addEventListener("load", () => {
		if(!t)
		document.getElementById("img2").src = (reader.result)
		changeCFile(reader.result)
	},
		false,
	)
	if(!t)
	await reader.readAsDataURL(document.getElementById('img').files[0])
	if(t){
		readerz = new FileReader();
		readerz.readAsText(document.getElementById('img').files[0], "UTF-8");
		readerz.onload = function (evt) {
			document.getElementById("holder").innerHTML = evt.target.result.replaceAll("\n","<br>")
			document.getElementById("holder").style = 'background: gray;margin:20px;padding:10px;border-radius:10px;'
		}
	}
	return 1
}
async function post() {
	let data
	let res
	try {
		switch (selected) {
			case 0:
				data = {
					type: "pozyczka",
					name: document.getElementById('name').value,
					sirname: document.getElementById('sirname').value,
					moneyz: document.getElementById('amount').value,
					img: file
				}
				res = await window.send.send(data)
				if (res)
					showMsg(true, `Error: ${res.code}\n${res.msg}`)
				else
					showMsg(false, `Dodano`)
				break
			case 2:
				data = {
					type: "pozyczkobiorca",
					name: document.getElementById('name').value,
					sirname: document.getElementById('sirname').value,
					moneyz: document.getElementById('moneyz').value,
					pesel: document.getElementById('pesel').value,
					sz: document.getElementById('employment').value
				}
				res = await window.send.send(data)
				if (res)
					showMsg(true, `Error: ${res}`)
				else
					showMsg(false, `Dodano`)
				break

		}
	}
	catch (e) {
		showMsg(true, `${e}`)
	}

}
async function searchList() {
	//document.getElementById("selectPerson").innerHTML = "<option value=-1 disabled>imie nazwisko pesel</option>"
	var opt = document.getElementById("search").value
	let res;
	if (opt == "") {
			const b = await window.get.list()
			document.getElementById('mainTable').innerHTML = `<tr><td><b>Imie</b></td><td><b>Nazwisko</b>
			</td><td><b>Pesel</b></td><td><b>Stan zatrudnienia</b></td><td><b>Edytój</b></td><td><b>Usuń</b></td></tr>`
			for (x in b) {
				document.getElementById('mainTable').innerHTML += `
				<tr><td id = 'name-${b[x][4]}'>${b[x][0]}</td>
				<td id = 'sirname-${b[x][4]}'>${b[x][1]}</td>
				<td id = 'pesel-${b[x][4]}'>${b[x][2]}</td>
				<td id = 'empl-${b[x][4]}'>${b[x][3]}</td>
				<td><input class='e' type="button" id = 'edit-${b[x][4]}' onclick="editItem(${b[x][4]})" value="E"></td>
				<td><input type="button" onclick="deleteItem(${b[x][4]})" value="X"></td>
				</tr>`
			}

		return;
	}
	const val = {
		option: document.getElementById("search").value,
		gut: document.getElementById("name").value,
		updatez: document.getElementById("s-type").value,
	}
	console.log(val)
	document.getElementById('mainTable').innerHTML = `<tr><td><b>Imie</b></td><td><b>Nazwisko</b>
			</td><td><b>Pesel</b></td><td><b>Stan zatrudnienia</b></td><td><b>Edytój</b></td><td><b>Usuń</b></td></tr>`
	try {
		res = await window.send.search(val)
	}
	catch (err) {
		showMsg(true, err)
	}
	for (x in res) {
				document.getElementById('mainTable').innerHTML += `
				<tr><td id = 'name-${res[x][4]}'>${res[x][0]}</td>
				<td id = 'sirname-${res[x][4]}'>${res[x][1]}</td>
				<td id = 'pesel-${res[x][4]}'>${res[x][2]}</td>
				<td id = 'empl-${res[x][4]}'>${res[x][3]}</td>
				<td><input class='e' type="button" id = 'edit-${res[x][4]}' onclick="editItem(${res[x][4]})" value="E"></td>
				<td><input type="button" onclick="deleteItem(${res[x][4]})" value="X"></td>
				</tr>`
	}
}
async function search() {
	document.getElementById("selectPerson").innerHTML = "<option value=-1 disabled>imie nazwisko pesel</option>"
	var opt = document.getElementById("search").value
	let res;
	if (opt == "") {
		res = await window.get.list()
		for (x in res) {
			document.getElementById('selectPerson').innerHTML += `<option value='${res[x][4]}'>
			${res[x][0]} ${res[x][1]} ${res[x][2]}</option>`
		}
		return;
	}
	const val = {
		option: document.getElementById("search").value,
		gut: document.getElementById("name").value,
		updatez: document.getElementById("s-type").value,
	}
	console.log(val)
	console.log(val)
	try {
		res = await window.send.search(val)
	}
	catch (err) {
		showMsg(true, err)
	}
	for (x in res) {
		document.getElementById('selectPerson').innerHTML += `<option value='${res[x][4]}'>
			${res[x][0]} ${res[x][1]} ${res[x][2]}</option>`
	}
}
function closeMsg(isError) {
	let msgId
	if (isError)
		msgId = "error"
	else
		msgId = "info"

	document.getElementById(msgId).style.opacity = 0;
	document.getElementById(msgId).style.zIndex = 0;
}
function showMsg(isError, msg) {
	let msgId
	if (isError)
		msgId = "error"
	else
		msgId = "info"
	closeMsg(~isError)
	document.getElementById(msgId).style.zIndex = 1;
	document.getElementById(msgId).style.opacity = 1;
	document.getElementById(`${msgId}-content`).innerHTML = msg;
}
