import { itemsByViewsKey, itemsKey, itemViewKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    // const inserted = await client.pfAdd(itemViewKey(itemId),userId);// insert user id into a HyperLogLog

    // if(inserted){
    //     return Promise.all([
    //         client.hIncrBy(itemsKey(itemId),'views',1) , // increment view in item map //(Map,field,increment by)
    //         client.zIncrBy(itemsByViewsKey(),1,itemId) // Increment view int items sssorted set //(Set,incr by,member)
    //     ]);
    // } // now views wont be incremented when same user keeps refreshing the page 

    //OR
    // above code usinf Lua script : this will hide the implementation
    return client.incrementView(itemId,userId); 


};


//TO create a script here 
// We need: 
// KEYS: itemViewKey, itemsKey, itemsByViewsKey
// ARGV: itemId, userId
