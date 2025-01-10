var selected = 1;

document.getElementById('scheme').addEventListener('click', async () => {
	const isDarkMode = await window.darkModez.toggle()
	document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})
document.getElementById('send').addEventListener('click', async () => {
	let data = {
		name: document.getElementById('name').value,
		sitname: document.getElementById('sirname').value,
		amount: document.getElementById('amount').value,
	}
	const res = await window.send.send(data)
	if(res.error)
		alert(res.msg)
})
document.getElementById('option-1').addEventListener('click', async () => {
	document.getElementById('option-1').className = 'selected'
	document.getElementById('option-1').disabled = true
	document.getElementById(`option-${selected}`).className = 'unselected'
	document.getElementById(`option-${selected}`).disabled = false 
	selected = 1
})
document.getElementById('option-2').addEventListener('click', async () => {
	document.getElementById('option-2').className = 'selected'
	document.getElementById('option-2').disabled = true
	document.getElementById(`option-${selected}`).className = 'unselected'
	document.getElementById(`option-${selected}`).disabled = false 
	selected = 2
})
document.getElementById('option-3').addEventListener('click', async () => {
	document.getElementById('option-3').className = 'selected'
	document.getElementById('option-3').disabled = true
	document.getElementById(`option-${selected}`).className = 'unselected'
	document.getElementById(`option-${selected}`).disabled = false 
	selected = 3
})
