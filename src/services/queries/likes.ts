import { client } from "$services/redis";
import { userLikesKey } from "$services/keys";
import { itemsKey } from "$services/keys";
import { getItems } from "./items";
//liked item will stay green after refresh
export const userLikesItem = async (itemId: string, userId: string) => {
    return client.sIsMember(userLikesKey(userId),itemId);
};

export const likedItems = async (userId: string) => {
    //Fetch all item ID's from this user's liked setuse
    const ids = await client.sMembers(userLikesKey(userId));

    //Fetch all the item hashes wiith those ids and return as an array
    return getItems(ids);

};

//User liked an object
export const likeItem = async (itemId: string, userId: string) => {
    // adding itemid in particular userLike set if user likes the item
    //sAdd will written 0 if itemId is already present userLike set else return 1
    const inserted = await client.sAdd(userLikesKey(userId),itemId); 

    if(inserted){
        return await client.hIncrBy(itemsKey(itemId),'likes',1);
    }
};
//user disliked an object
export const unlikeItem = async (itemId: string, userId: string) => {
    const removed = await client.sRem(userLikesKey(userId),itemId);
    if(removed){
        return await client.hIncrBy(itemsKey(itemId),'likes',-1);
    }
};


export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
    //Common liked item between two user
    //usinf intersection
    const ids = await client.sInter([userLikesKey(userOneId),userLikesKey(userTwoId)]);
    return getItems(ids);
};
