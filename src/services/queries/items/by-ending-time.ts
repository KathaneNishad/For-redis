import { itemsByEndingAtKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

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
	const command = ids.map((id)=>{ //ids : array of item ids
		return client.hGetAll(itemsKey(id)); // map function to iterate through each id and get each item
	});

	const result = await Promise.all(command); // Promise to get all the command async call and store them in array result

	return result.map((item,i) =>  // i is to loop through ids of item and the used in map to deserialze them one by one
		deserialize(ids[i],item)
	);
};
