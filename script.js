
var testObj = {}
var ipStart = '192.168.0'
let evtSource = {}

document.getElementById("clearStorage").addEventListener("click", ()=>{
    chrome.storage.local.clear() 
    chrome.storage.sync.clear()
});

document.getElementById("btnShowSettings").addEventListener("click", ()=>{
    let divSettings = document.getElementById("divSettings")
    if(divSettings.style.display == 'none') divSettings.style.display = "block"
    else divSettings.style.display = "none"
});


var inputIpStart = document.getElementById("inputIpStart")
document.getElementById("inputIpStart").addEventListener("change", ()=>{
    if(inputIpStart.value != ipStart) inputIpStart.style.backgroundColor = 'yellow'
    else inputIpStart.style.backgroundColor = 'white'
});
document.getElementById("btnSaveSettings").addEventListener("click", ()=>{
    chrome.storage.sync.set({config_ipStart : inputIpStart.value}, ()=> {
        console.log('sync.set --> ', 'config_ipStart', inputIpStart.value)
    })
    ipStart = inputIpStart.value
    inputIpStart.style.backgroundColor = 'white'
});



init()
async function init(){
    //var devices = {}
    await chrome.storage.sync.get(null, async function(items) {
        for (let [key, value] of Object.entries(items)) {
            if(key.includes('config_')){
                ipStart = value
                document.getElementById("inputIpStart").value = ipStart
                continue
            }
            //if(!devices[value.device]) devices[value.device] = {}
            //if(!devices[value.device][key]) devices[value.device][key] = {}
            //devices[value.device][key] = value
            await esphomeElementsInit({[value.device]:{[key]:value}})
        }
    })
}


const elScanForDevices = document.getElementById("scanForDevices")
elScanForDevices.addEventListener("click", async ()=>{
    elScanForDevices.textContent = "Scanning...  "
    testObj = {}
    for (let i = 0; i < 255; i++) {
         checkIp(`http://${ipStart}.${i}/events`)
    }
    let count = 0
    let loop = setInterval(()=>{
        elScanForDevices.textContent = "Scanning... " + Math.round(Object.keys(testObj).length/255*100) + "%"
        console.log('Scanning...', Math.round(Object.keys(testObj).length/255*100) + "%", '\t',Object.keys(testObj).length)
        if(Object.keys(testObj).length >= 255 || count > 1200) {
            elScanForDevices.textContent = "Scan for devices"
            console.log('Scanned',testObj)
            clearInterval(loop)
        }
        count += 1
    }, 1000)
});

async function eventHandler(adr, id,device){
    adr = adr + '/events'
    if(evtSource[id] && evtSource[id].url.toLowerCase() == adr.toLowerCase() && evtSource[id].readyState == 1) return //console.log('HM1?', evtSource[id].url != adr, evtSource[id].url, adr, evtSource[id])
    else if(evtSource[id] && evtSource[id].url.toLowerCase() != adr.toLowerCase())return console.log('HM2?', evtSource[id].url != adr, evtSource[id].url, adr)

    evtSource[id] = new EventSource(adr)
    evtSource[id].addEventListener("error", (err) => {  
        if(document.getElementById(`${id}_status`) != undefined)
            document.getElementById(`${id}_status`).textContent = String.fromCodePoint('0x21BA')
        if(evtSource[id]) evtSource[id].close();  
        const el = document.getElementById(`${id}_status`)
        el.style.backgroundColor = 'gray'
    });
    evtSource[id].addEventListener('state', (e)=>{
        let data = JSON.parse(e.data)
        // {"id":"light-athom_light_15w_rgbct_dfb57b","state":"ON","color_mode":"color_temp","brightness":54,"color":{},"color_temp":153}
        // {"id":"switch-athom_plug_test","value":false,"state":"OFF"}
        // {"id":"switch-athom_plug_test","value":true,"state":"ON"}
        let obj = {
            id: data.id.split('-')[1],
            state: data.state, // ON/OFF
        }
        if((device == 'athom-light' || device == 'light') && id == obj.id && data.brightness!=undefined){
            obj = {...obj,
                color_mode: data.color_mode,
                brightness: data.brightness,
                color: data.color, 
                color_temp: data.color_temp, // 500-153
            }
            console.log('athom-light', obj, e.data)
            const el = document.getElementById(`${id}_status`)
            el.textContent = (obj.state=='ON')? 'ON' : 'OFF'
            el.style.backgroundColor = (obj.state=='ON')? 'green' : 'red'
        }
        if((device == 'athom-plug' || device == 'switch') && id == obj.id){
            obj = {...obj,
                value: data.value,
            }
            console.log('athom-plug', obj, e.data)
            const el = document.getElementById(`${id}_status`)
            el.textContent = (obj.value)? 'ON' : 'OFF'
            el.style.backgroundColor = obj.value? 'green' : 'red'
        } 
        
        else if(document.getElementById(`${id}_status` && obj.state)){
            const el = document.getElementById(`${id}_status`)
            el.textContent = (obj.state=='ON')? 'ON' : 'OFF'
            el.style.backgroundColor = (obj.state=='ON')? 'green' : 'red'
        }
    });
    
}


async function checkIp(ip, ){
    let evt = new EventSource(ip)
    evt.addEventListener('state', (e)=>{
        let data = JSON.parse(e.data)
        if(!e) return
        if(!e.data) return
        if(!data || !data.id || !data.name || !data.id) return evt.close()
        let obj = {
            device: data.id.split('-')[0],
            id: data.id.split('-')[1],
            name: data.name,
            _name: data.name.replaceAll(' ', '-'),
            ip: ip
        }
        obj['url'] = `http://${obj._name}.local`
        obj['requestUrl'] = `http://${obj._name}.local/${obj.device}/${obj.id}`
        checkIfRightId({url:obj.requestUrl}).then((result)=>{          
            if(result) {
                testObj[ip] = 'Found'
                setDeviceObject(obj)
                evt.close();
            }
        })

    });
    evt.addEventListener("error", (err) => {  
        testObj[ip] = 'Err'
        evt.close();  
    });
}

async function checkIfRightId({url}={}){
    try{
        return await fetch(`${url}`, {mode: 'cors',});
    }catch(err){}
}


async function setDeviceObject(obj){
    let {device, id, name, _name, ip, url, requestUrl} = obj
    //if(device=='light'){}
    //if(device=='switch'){}
    chrome.storage.sync.set({[id]:obj}, ()=> {
        console.log('sync.set', id, obj)
    })
    await esphomeElementsInit({[device]: {[id]:obj}})
    eventHandler(url, id, device)
    return obj
}

/* var requests = {
    light: {
        turn_on: (obj)=>{
            // http://athom-light-15w-rgbct-dfb5cf.local/light/athom_light_15w_rgbct_dfb5cf/turn_on?brightness=136&transition=10&r=55&g=255&b=255
            let {color_mode, brightness, color_temp, r,g,b} = obj
            let str
            for (const [key, value] of Object.entries(obj)) {
                if(!key || !value) continue
                str = (!str)? '/turn_on?' : '&'
                str += `${key}=${value}`
            }
            return str
        },
    },
} */

