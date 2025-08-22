import type { CreateItemAttrs } from '$services/types';
import { client } from '$services/redis';
import { genId } from '$services/utils';
import { itemsKey } from '$services/keys';
import { serialize } from './serialize';
import { deserialize } from './deserialize';



export const getItem = async (id: string) => {
    const item = await client.hGetAll(itemsKey(id));

    if(Object.keys(item).length === 0){
        return null;
    }
    return deserialize(id,item);
};

export const getItems = async (ids: string[]) => { //ids : arrays of item ids
    const command = ids.map((id)=>{
        return client.hGetAll(itemsKey(id)); // here it will run the command for each id from ids[] and call async redis call(hGetAll) then store them in a array
    })

    const result = await Promise.all(command); // Promise.all() will take each command result in parallel and store them in array of object

    return result.map((result,i)=>{
        if(Object.keys(result).length === 0){
        return null;
    }
    return deserialize(ids[i],result);
    })
};

export const createItem = async (attrs: CreateItemAttrs) => {
    //generates an ID
    const id = genId();
    await client.hSet(itemsKey(id),serialize(attrs));
    return id;
};
