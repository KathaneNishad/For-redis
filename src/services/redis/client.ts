import { createClient, defineScript } from 'redis';

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW,

	//Define all your scripts here
	scripts:{
		addOneAndStore: defineScript({
			NUMBER_OF_KEYS: 1, //defining number of keys we are going to acess beforehand
			SCRIPT: `
				return redis.call(
				'SET', 
				KEYS[1], 
				1 + tonumber(ARGV[1]))	
			`,//Script itself
			//Passing arguments to the script
			transformArguments(key: string,value: string){
				return [key, value.toString()];
				//['someKey','value']
				//EVALHA <sciptId> 1 'someKey' 'value' 
			},
			//Returning the output of script
			transformReply(reply: any){
				return reply;
			}
		})
	}
});

client.on('connect',async()=>{
	await client.addOneAndStore('books:count','5');
	const result = await client.get('books:count');
	console.log(result);
});

client.on('error', (err) => console.error(err));
client.connect();

export { client };
