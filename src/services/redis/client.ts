import { incrementView } from '$services/queries/views';
import { createClient ,defineScript} from 'redis';
import { itemsByViewsKey, itemsKey, itemViewKey } from "$services/keys";


const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW,

	//Define all your scripts here
	scripts:{
		unlock: defineScript({
			NUMBER_OF_KEYS: 1,
			SCRIPT: `
				if redis.call('GET',KEYS[1]) == ARGV[1] then
					return redis.call('DEL',KEYS[1])
				end
			`,
			transformArguments(key: string, token: string){ // token is value of the key, key:value or key:token
				return [key, token]
			},
			transformReply(){}
		}),

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
		}),

		incrementView: defineScript({
			NUMBER_OF_KEYS: 3,
			SCRIPT:`
				local itemViewKey = KEYS[1]
				local itemsKey = KEYS[2]
				local itemsByViewsKey= KEYS[3]
				local itemId = ARGV[1]
				local userId = ARGV[2]

				local inserted = redis.call('PFADD',itemViewKey,userId)

				if inserted == 1 then
					redis.call('HINCRBY', itemsKey ,'views',1)
					redis.call('ZINCRBY', itemsByViewsKey, 1, itemId)
				end
			`,
			transformArguments(itemId: string, userId: string){
				return [
					itemViewKey(itemId), // items:views#asd 
					itemsKey(itemId), // items#wer
					itemsByViewsKey(), //items:view
					itemId, //asd
					userId  //usd 
				];

				//EVALSHA <SCRIPTID> 3 items:views#asd items#wer items:view asd usd 
			},
			//As nothing to return
			transformReply(){}
		})
	}
});

// client.on('connect',async()=>{
// 	await client.addOneAndStore('books:count','10');
// 	const result = await client.get('books:count');
// 	console.log(result);
// });

client.on('error', (err) => console.error(err));
client.connect();

export { client };
