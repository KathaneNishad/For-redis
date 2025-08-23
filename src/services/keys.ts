export const pageCacheKey = (id : string) => `pagecache#${id}`;
export const usersKey = (id : string) => `user#${id}`;
export const sessionKey = (sessionId:string) => `sessions#${sessionId}`;
export const itemsKey = (itemId: string) => `items#${itemId}`;
export const usernameUniqueKey = () => `username:unique`;
export const userLikesKey = (userId:string)=>`userlike#${userId}`;