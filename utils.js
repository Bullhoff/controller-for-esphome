AbortSignal.timeout ??= function timeout(ms) {
	const ctrl = new AbortController()
	setTimeout(() => ctrl.close(), ms)
	return ctrl.signal
}

async function fetchGet({url, param={}, method='GET'} = {}) { 
	try{
		return await fetch (url, {mode: 'cors',});
	}catch(err){
		return err
    }
}
async function fetchPost({url, param={}, method='POST'} = {}) { 
	var data = new FormData();
	for (const [key, value] of Object.entries(param)) {
		data.append(key, value);
	}
	console.log('data', data)
    try{
		const res=await fetch (url, {
			mode: 'cors', 
			method: method,
		});
        return res
	}catch(err){
		return err
    }
}