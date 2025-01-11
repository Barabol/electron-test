var selected = 0;

init()
async function theme(){
	const isDarkMode = await window.darkModez.toggle()
	document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
}

async function init(){
	const data = await window.get.selections(12)
	let content = "<tr>"
	for(x in data){
			content += `<td><input type="button" id="option-${x}" class="unselected" value = "${data[x].name}" onclick="setOption(${x})"></td>`
		console.log(data[x])
	}
	content+="<td><button id=\"scheme\"><img src=\"src/img/theme.png\" width=\"13px\" height=\"13px\" onclick=\"theme()\"></button></td></tr>"
	document.getElementById("options").innerHTML = content
	setOption(0)
}

async function setOption(id){
	document.getElementById(`option-${selected}`).disabled = false
	document.getElementById(`option-${selected}`).className = "unselected"
	document.getElementById(`option-${id}`).disabled = true
	document.getElementById(`option-${id}`).className = "selected"
	selected = id
	const data = await window.get.site(id)

	if(!data){
		document.getElementById("content").innerHTML="not found"
		return
	}
	document.getElementById("content").innerHTML = data 
}

async function post(){
	let data = {
		name: document.getElementById('name').value,
		sirname: document.getElementById('sirname').value,
		amount: document.getElementById('amount').value,
	}
	const res = await window.send.send(data)
	if (res.error)
		alert(res.msg)
}
