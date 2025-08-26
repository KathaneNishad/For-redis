import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { usernamesKey, usernameUniqueKey, usersKey } from '$services/keys';  // 

export const getUserByUsername = async (username: string) => {
    // username argument to look up person ID with sorted username
    //Sorted SET : usernamesKey()
    //member : username   
    //score : userId or decimalId
    const decimalId = await client.zScore(usernamesKey(),username);

    if(!decimalId){
        throw new Error("User not found");
    }

    //Take th id and cover bake to HexaDecimal Format
    const id = decimalId.toString(16);

    //look up user hash
    const user = await client.hGetAll(usersKey(id));

    //deserialize
    return deserialize(id, user);


};

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
    await client.zAdd(usernamesKey(),{
        value:attrs.username,
        score: parseInt(id,16)    //parse because the sorted set takes score as Integer and genId() function will give value in a String
    });
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