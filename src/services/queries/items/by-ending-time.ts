import { itemsByEndingAtKey } from "$services/keys";
import { client } from "$services/redis";

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0, //values we want to skip
	count = 10 //values we want 
) => {
	//get the item ids have endingAt time that are soonest or time between now and future
	const ids = await client.zRange(itemsByEndingAtKey(),  //set
	Date.now(), // starting value
	'+inf', //ending value for range ,can say future
	{
		BY: 'SCORE', //SORT by score,
		LIMIT: {     // Functions for ssorted set
			offset,
			count
		}

	}
);
console.log(ids); // load items ids that are soonest
};
