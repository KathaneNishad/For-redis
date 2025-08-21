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

export const getItems = async (ids: string[]) => {};

export const createItem = async (attrs: CreateItemAttrs) => {
    //generates an ID
    const id = genId();
    await client.hSet(itemsKey(id),serialize(attrs));
    return id;
};
