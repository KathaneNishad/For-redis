import { client } from '$services/redis';
import type { Session } from '$services/types';
import { sessionKey } from '$services/keys';

export const getSession = async (id: string) => {
    const session = await client.hGetAll(sessionKey(id));
    // if there is no session for sessionKeyid redis will give an empty session onject anywayc
    // to avoid that we are going check the session is empty first if yes firectly return null else give the valid session which was present
    if(Object.keys(session).length === 0){ 
        return null
    }

    return deserialize(id,session);
};

export const saveSession = async (session: Session) => {};

const deserialize = (id:string,session:{[key:string]:string})=>{
    return {
        id,
        userId : session.userId,
        password : session.password
    }
}
