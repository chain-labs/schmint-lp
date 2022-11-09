import InputDataDecoder from 'ethereum-input-data-decoder';
import { getABIType } from '../project-page/utils';

export const getSchmintQuantity = (abi: any, data: string) => {
	// console.log('abi', abi);
	const decoder = new InputDataDecoder(abi);
	const res = decoder.decodeData(data);
	switch (getABIType(abi)) {
		case 1: {
			return parseInt(res.inputs[1]);
		}
		case 2: {
			return parseInt(res.inputs[0]);
		}
		case 3: {
			return parseInt(res.inputs[0]);
		}
	}
};
