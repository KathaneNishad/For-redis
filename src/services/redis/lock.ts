import { randomBytes } from "crypto";
import { client } from "./client";

//cb is our callback function
	//passing it with a proxied Redis client
	//a signal object if the lock has been expired in between the operation
export const withLock = async (key: string, cb: (redisClient: Client,signal: any)=>any) => { 
	//Initialize a few variables to control retry behaviour
	const retryDelayMs =100;
	const timeoutMs = 2000;
	let retries = 20;

	// Generate a random value to store at the lock key
	const token = randomBytes(6).toString('hex');
	// Create the unique lock key
	const lockKey = `lock:${key}`;

	// Set up a while loop to implement retry behaviour
	while(retries >= 0){
		retries--; 
		// Try to do SET NX operation
		const acquired = await client.set(lockKey, token, {
			NX: true, // THIS MEAN ONLY SET THE IF A VALUE DOES NOT ALREADY EXIST
			PX: 2000 // expire after 2000 ms
		});

		if(!acquired){
			// Else a brief pause for <retryDelayMs> milliseconds and the retry
			await pause(retryDelayMs)
			continue;
		}
		// If the set is successful, then run the callback 
		try{
		//signal object that the callback can check to know if the lock expired mid-operation
		const signal = {expired: false};
		setTimeout(() => {
			signal.expired = true;
		}, timeoutMs);


		//Wrap the client with a proxy // a proxy Redis client which will throw error after access time 
		const proxiedClient = buildClientProxy(timeoutMs);

		const result = await cb(proxiedClient,signal);
		return result;
		}
		// Unlock the lock key (Critical)
		finally{
		await client.unlock(lockKey,token); // A LUA Script // if before expiry time it will work else after expiry time it wont do anything // resolved a deleting key issue 
		}
		
	}
	

	// Unset the lock key


};

type Client = typeof client;
//It wraps the Redis client in a Proxy that blocks all method calls after the lock timeout, 
// and safely forwards property/method access before that.
const buildClientProxy = (timeoutMs: number) => {
	const startTime = Date.now();

	const handler = {
		get(target: Client, prop: keyof Client){ // wrapped object: client, prop :the property being accessed like set, get
			if(Date.now() >= startTime + timeoutMs){
				throw new Error('Lock has expired!');
			}
			const value = target[prop];
			return typeof value === 'function' ? value.bind(target): value;
		}
	};
	return new Proxy(client, handler) as Client; 
};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
