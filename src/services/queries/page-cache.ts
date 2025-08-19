import { client } from "$services/redis";
import { pageCacheKey } from "$services/keys";

const cacheRoutes= ['/about','/privacy','/auth/signup'];

export const getCachedPage = (route: string) => {
    if(cacheRoutes.includes(route)){
        //GET key
        return client.get(pageCacheKey(route));  //pagecahce#route : this will be out key 
    }
    return null;
};

export const setCachedPage = (route: string, page: string) => {
    if(cacheRoutes.includes){
        //SET key value EX 5 
        return client.set(pageCacheKey(route), page,{
            EX: 5  // Expiration time
        })
    }
};
