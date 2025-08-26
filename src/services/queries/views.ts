import { itemsByViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    return Promise.all([
        client.hIncrBy(itemsKey(itemId),'view',1) , // increment view in item map //(Map,field,increment by)
        client.zIncrBy(itemsByViewsKey(),1,itemId) // Increment view int items sssorted set //(Set,incr by,member)
    ]);
};
