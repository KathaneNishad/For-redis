import type { CreateItemAttrs } from '$services/types';

export const serialize = (attrs: CreateItemAttrs) => {
    return {
        //this ...attrs will take copy all the properties from object attrs
        ...attrs,  
        // we can reformat properties as per required 
        createdAt: attrs.createdAt.toMillis(), // format to milliseconds or unix time
        endingAt: attrs.endingAt.toMillis()
    };
};
