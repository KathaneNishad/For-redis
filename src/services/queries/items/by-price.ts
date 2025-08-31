import { itemsByPriceKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

//get the Most Expensive item ssorted by bid price
export const itemsByPrice = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
    
	let results:any = await client.sort(itemsByPriceKey(),{
            GET: ['#',
                `${itemsKey('*')}->name`,
                `${itemsKey('*')}->views`,
                `${itemsKey('*')}->endingAt`,
                `${itemsKey('*')}->imageUrl`,
                `${itemsKey('*')}->price`,
            ], // Data joining
                 
            BY: 'nosort', // not sorting the original order
            DIRECTION: order, // order : DESC is default
            LIMIT:{
                offset, //skip the records
                count // number of record to get
            }
        }) // this return a flat array i.e [id,name,views,id1,name1,view1....]
    
        const items = [];
        while(results.length){
            const [id, name, views, endingAt, imageUrl, price, ...rest] = results; // destructoring of data 
            const item = deserialize(id,{name, views, endingAt, imageUrl, price});
            items.push(item);
            results = rest;
        }
        return items;
        //console.log(results);
};
