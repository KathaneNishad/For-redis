import { client } from '$services/redis';
import type { Session } from '$services/types';
import { sessionKey } from '$services/keys';
import { session } from '$app/stores';

export const getSession = async (id: string) => {
    const session = await client.hGetAll(sessionKey(id));
    // if there is no session for sessionKeyid redis will give an empty session object anywayc
    // to avoid that we are going check the session is empty first if yes firectly return null else give the valid session which was present
    if(Object.keys(session).length === 0){ 
        return null;
    }

    return deserialize(id,session);
};

export const saveSession = async (session: Session) => {
   return client.hSet(
    sessionKey(session.id),
    serialize(session)
    );
};

//opening a session object
const deserialize = (id:string,session:{[key:string]:string})=>{
    return {
        id,
        userId : session.userId,
        username : session.username
    };
};
//Note boxing a session object
const serialize = (session: Session) => {
    return {
    userId: session.userId,
    username: session.username
    };
};
