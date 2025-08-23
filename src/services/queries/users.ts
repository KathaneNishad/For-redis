import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { usernameUniqueKey, usersKey } from '$services/keys';  // 

export const getUserByUsername = async (username: string) => {};

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id));
    return deserialize(id,user);
};


export const createUser = async (attrs: CreateUserAttrs) => {
    const id = genId();
    //see if username is already in set
    const exist = await client.sIsMember(usernameUniqueKey(),attrs.username); // Key, value to check
    //check 
    if(exist){
        throw new Error("Username is taken");
    }
    //otherwise
    await client.hSet(usersKey(id),serialize(attrs));
    await client.sAdd(usernameUniqueKey(),attrs.username);
    return id
};

//Serialize function => what ever object/data we got is convert to redis format 
//simply putting it everything will be type of string 
//we are not mentioning id in our serialized obj
const serialize =(user:CreateUserAttrs) =>{
    return {
        username : user.username,
        password : user.password
    }
};

//deserealize function for getUserById
//while deseializing we mention id (this is optional as per use)
//deserialize will return object value with their orignal types
const deserialize =(id:string,user:{[key:string]:string})=>{
    return {
        id,
        username : user.username,
        password : user.password
    }
};