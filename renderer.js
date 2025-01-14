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
		case 2:
			const a = await window.get.employment()
			for (x in a)
				document.getElementById('employment').innerHTML += `<option value = ${x}>${a[x]}</option>`
			break
		case 5:
			const b = await window.get.list()
			//const b = ['a']
			document.getElementById('mainTable').innerHTML = `<tr><td><b>Imie</b></td><td><b>Nazwisko</b>
			</td><td><b>Pesel</b></td><td><b>Stan zatrudnienia</b></td></tr>`
			for (x in b) {
				document.getElementById('mainTable').innerHTML += `<tr><td>${b[x][0]}</td><td>${b[x][1]}</td><td>${b[x][2]}</td><td>${b[x][3]}</td></tr>`
			}
			break
	}
}

var file = ""
async function setFile() {
	function changeCFile(content) {
		file = content
	}
	reader = new FileReader()
	await reader.addEventListener("load", () => {
		document.getElementById("img2").src = (reader.result)
		changeCFile(reader.result)
	},
		false,
	)
	await reader.readAsDataURL(document.getElementById('img').files[0])
	return 1
}
async function post() {
	let data
	switch (selected) {
		case 2:
			data = {
				type: "pozyczkobiorca",
				name: document.getElementById('name').value,
				sirname: document.getElementById('sirname').value,
				moneyz: document.getElementById('moneyz').value,
				pesel: document.getElementById('pesel').value,
				sz: document.getElementById('employment').value
			}
			const res = await window.send.send(data)
			if (res)
				alert(`Error: ${res.code}\n${res.msg}`)
			break
	}

}
