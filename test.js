





async function getIdFromEvent(address = `http://athom-plug-test.local/events`){
			return await fetch(address)
				.then((response) => response.body)
				.then(async(rb) => {
				const reader = rb.getReader()
				return await new ReadableStream({
					 start(controller) {
						let count = 0
						return pump();
						function pump() {
						  return reader.read().then(({ done, value }) => {
							
							//retry: 30000
							//id: 550994889
							//event: ping
							//data: {"title":"athom-plug-monitor-acer-24in","ota":true,"lang":"en"}
	
							//event: state
							//data: {"id":"binary_sensor-athom_plug_monitor_acer_24in_status","name":"Athom Plug Monitor Acer 24in Status","value":true,"state":"ON"}
													
							let res = Decodeuint8arr(value)
							if (done || count>99 || (res && res.includes('data:'))) {
								controller.enqueue(value);
								controller.close();
								return
								
							}
							count += 1
							
							//return pump();
							pump();
						  });
						}
					  },
				})
			})
			.then((stream) => new Response(stream))
			.then(async (response) => await response.text())
			.then((text) => {
				try{
					return JSON.parse(text.split('data: ').at(-1))
				}catch(err){return null;}
			})
			.then((obj) => {
				try{
					return (obj.title) ? obj.title : obj 
				}catch(err){return null;}
			})
			.catch((err) => console.error(err))
}


async function tests(){
	var url = `http://athom-plug-test.local`
	var arr = [
		{path: `${url}/`},	// CORS
		{path: `${url}/events`},
		{path: `${url}/sensor`},	// CORS
		{path: `${url}/binary_sensor`},	// CORS
		{path: `${url}/switch`},	// CORS
		{path: `${url}/light`},	// CORS
		{path: `${url}/fan`},
		{path: `${url}/cover`},
		{path: `${url}/select`},
		{path: `${url}/button`},
		{path: `${url}/number`},
		{path: `${url}/text_sensor`},
	]
	const testButtons = document.getElementById("testButtons")
	testButtons.style.display = 'flex'
	testButtons.style.flexDirection = 'row'
	const div = document.createElement("div");
	ids = []
	
}
function Decodeuint8arr(uint8array){
    return new TextDecoder("utf-8").decode(uint8array);
}
