//Note to self :: why this keys were created, for what type of set

import { itemsByViews } from "./queries/items";

export const pageCacheKey = (id : string) => `pagecache#${id}`;
export const sessionKey = (sessionId:string) => `sessions#${sessionId}`;


//Users
export const usersKey = (id : string) => `user#${id}`;
export const usernameUniqueKey = () => `username:unique`;
export const userLikesKey = (userId:string)=>`userlike#${userId}`;
//Sorted Set to store username as member and ID as score
export const usernamesKey = ()=>`usernames`;


//Items
export const itemsKey = (itemId: string) => `items#${itemId}`;
//Sorted Set to store item views
export const itemsByViewsKey = ()=>`items:view`;
//Sorted Set to store item ending at time stamp
export const itemsByEndingAtKey = ()=>`items:endingAt`;
export const itemViewKey = (itemId:string)=>`items:views#${itemId}`;
export const bidHistoryKey = (itemId:string) => `history#${itemId}`;
export const itemsByPriceKey = () =>`item:price`;

