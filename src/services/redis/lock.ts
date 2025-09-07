import { randomBytes } from "crypto";
import { client } from "./client";

export const withLock = async (key: string, cb: (signal: any)=>any) => { //cb is our callback function
	//Initialize a few variables to control retry behaviour
	const retryDelayMs =100;
	let retries = 20;

	// Generate a random value to store at the lock key
	const token = randomBytes(6).toString('hex');
	// Create the lock key
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
		const signal = {expired: false};
		setTimeout(() => {
			signal.expired = true;
		}, 2000);
		
		const result = await cb(signal);
		return result;
		}
		// Unlock the lock key (Critical)
		finally{
		await client.unlock(lockKey,token); // A LUA Script // if before expiry time it will work else after expiry time it wont do anything // resolved a deleting key issue 
		}
		
	}
	

	// Unset the lock key


};

const buildClientProxy = () => {};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
