import { bidHistoryKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { DateTime } from 'luxon';
import { getItem } from './items';

export const createBid = async (attrs: CreateBidAttrs) => {
	const item = await getItem(attrs.itemId); // reusing the getItem() which will serialize and deserialize the object as we need

	if(!item){
		throw new Error('Item does not exist');
	}
	if(item.price>=attrs.amount){ // compare price of item with bid price
		throw new Error('Bid is too low');
	}
	if(item.endingAt.diff(DateTime.now()).toMillis()<0){ //validates if the bid ending time is a past time now
		throw new Error('Item closed to biding');
	}
	
	const serialized = serrializeHistory(attrs.amount, attrs.createdAt.toMillis());
	

	return client.rPush(bidHistoryKey(attrs.itemId),serialized);
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const endIndex = -1 - offset;

	const range = await client.lRange(
		bidHistoryKey(itemId),
			startIndex,
			endIndex	
	);

	return range.map(bid =>deserializeHistory(bid));
};

//Serailize function to srored amount and createdAt as same element
const serrializeHistory = (amount: number, createdAt: number)=>{
	return `${amount}:${createdAt}`;
};

const deserializeHistory = (stored : string)=>{
	const [amount, createdAt] = stored.split(":"); //destructuring from amount:createdAt to [amount, createdAt]

	return {
		amount:parseFloat(amount),
		createdAt:DateTime.fromMillis(parseInt(createdAt))
	};
}
