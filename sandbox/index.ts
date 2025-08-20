import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
    await client.hSet('company',{
        name : 'CT',
        domain : 'HC',
        year : '2255'
    })

    const comp = await client.hGetAll('company');
    console.log(comp);
};
run();
