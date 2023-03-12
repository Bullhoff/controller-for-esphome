
//const output = document.getElementById("output")
const devicesDiv = document.getElementById("devices")


async function esphomeElementsInit(devices){
	for (const [keyCategory, valueCategory] of Object.entries(devices)) {
		if(!keyCategory || !valueCategory || keyCategory == undefined || valueCategory == undefined) continue;
		if(!document.getElementById(keyCategory))	await pushCategory(keyCategory)
		const deviceCategory = document.getElementById(keyCategory)

		for (const [keyDevice, valueDevice] of Object.entries(valueCategory)) {
			if(keyDevice == undefined || valueDevice == undefined) continue;
			//if(document.getElementById(valueDevice.id)) continue;
			if(document.getElementById(valueDevice.id)) {
				//document.getElementById(valueDevice.id).remove()
				document.getElementById(`${valueDevice.id}_row`).remove()
			}
			
			const div = await rowDiv()

			/* 
			const btn = await xButton()
			div.appendChild(btn)
			
			const elParametersButton = await parametersButton()
			div.appendChild(elParametersButton) 
			*/

			const elSwitchButton = await switchButton(valueDevice.id, valueDevice.requestUrl, valueDevice.url, valueDevice.deviceCategory, )
			div.appendChild(elSwitchButton)

			const elRowTitle = await rowTitle(valueDevice.id, valueDevice.name)
			div.appendChild(elRowTitle)

			/* 
			if(valueDevice.device == 'light'){
				const elColorPicker = await colorPicker(valueDevice.id)
				div.appendChild(elColorPicker)

				const elRange = await range(valueDevice.id)
				div.appendChild(elRange)
			} 
			*/
			
			eventHandler(valueDevice.url, valueDevice.id, valueDevice.device)
			deviceCategory.appendChild(div)
		}
		devicesDiv.appendChild(deviceCategory)
	}
	
}

async function pushCategory(name){
	const btn = document.createElement("button");
	const div = document.createElement("div");
	div.id = name
	div.style.display = 'block'
	div.style.position = 'relative'
	btn.textContent = `${name.charAt(0).toUpperCase()+name.slice(1)}`
	btn.style.backgroundColor = 'blue'
	btn.style.display = 'block'
	btn.addEventListener("click", async()=>{
		div.style.display = (div.style.display == 'block') ? 'none' : 'block'
	});
	devicesDiv.appendChild(btn)
	devicesDiv.appendChild(div)
}
async function rowDiv(id){
	const div = document.createElement("div");
	div.id = `${id}_row`
	return div
}

async function switchButton(id, requestUrl, url, device){
	const btn = document.createElement("button");
	btn.id = `${id}_status`
	btn.style.backgroundColor = 'gray'
	btn.style.minWidth = '5ch'
	btn.textContent = String.fromCodePoint('0x23F3') 
	btn.addEventListener("click", async()=>{
		if(document.getElementById(`${id}_status`).textContent == String.fromCodePoint('0x21BA')){
			document.getElementById(`${id}_status`).textContent = String.fromCodePoint('0x23F3')
			await eventHandler(url, id, device)
		}
		let res = await fetchPost({url: `${requestUrl}/toggle`})
		let resVal = {}
		try{
			resVal['json'] = await res.json()
		}catch(err){/* console.log('ERR', err) */}
		try{
			resVal['text'] = await res.text()
		}catch(err){/* console.log('ERR', err) */}

		if(resVal['json']){
			if(resVal.json.state == 'OFF') btn.style.backgroundColor = 'red'
			if(resVal.json.state == 'ON') btn.style.backgroundColor = 'green'
		}
	});

	return btn
}

async function rowTitle(key, name){
	const btn = document.createElement("button");
	btn.id = `${key}`
	btn.textContent = `${name}`
	btn.style.backgroundColor = 'gray'
	btn.addEventListener("click", async()=>{ })
	return btn
}

/* 

async function range(key){
	const input = document.createElement("input");
	input.type = "range"
	input.min = 0
	input.max = 255
	input.defaultValue = 100
	input.addEventListener("change", async()=>{ 
		console.log('range ', key, input.value)
	})
	return input
}
async function colorPicker(key){
	const input = document.createElement("input");
	input.type = "color"
	input.value = `${'#000000'}`
	input.addEventListener("change", async()=>{ 
		console.log('colorPicker', key, input.value)
	})
	return input
}

async function xButton(){
	const btn = document.createElement("button");
	btn.textContent = `X`
	btn.addEventListener("click", async()=>{})
	return btn
}

async function parametersButton(){
	const btn = document.createElement("button");
	btn.textContent = '🔧';//`&#128295;`
	btn.addEventListener("click", async()=>{
		chrome.windows.create({url: "parameters.html", type: "popup", height:200, width:200});
	})
	return btn
}


 */