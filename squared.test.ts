import { OutputBuilder, SAFE_MIN_BOX_VALUE, SLong, TransactionBuilder } from '@fleet-sdk/core';
import { describe, expect, it } from 'vitest';
import { POOL_ADDRESS, POOL_MNEMONIC, utxo } from './constants';
import { compileContract, signTx } from './sign';

const height = 1209955;

describe('squared', () => {
	it('works', async () => {
		const CONTRACT = `{
			val input  = SELF.R4[Long].get
			val output = SELF.R5[Long].get

			def squared(l: Long) = l*l

			sigmaProp(squared(input) == output)
		}`;
		const contract_address = compileContract(CONTRACT, {});

		const output = new OutputBuilder(
			2n * SAFE_MIN_BOX_VALUE + SAFE_MIN_BOX_VALUE,
			contract_address,
		).setAdditionalRegisters({
			R4: SLong(3n).toHex(),
			R5: SLong(12n).toHex(),
		});

		const unsignedTx = new TransactionBuilder(height)
			.from(utxo)
			.to(output)
			.sendChangeTo(POOL_ADDRESS)
			.payFee(SAFE_MIN_BOX_VALUE)
			.build()
			.toEIP12Object();
		const signedTx = await signTx(unsignedTx, POOL_MNEMONIC);
		expect(signedTx).toBeDefined();

		const squaredBox = signedTx.outputs[0];

		const spendSquareBoxTx = new TransactionBuilder(height)
			.from(squaredBox)
			.sendChangeTo(POOL_ADDRESS)
			.payFee(SAFE_MIN_BOX_VALUE)
			.build()
			.toEIP12Object();
		const signedSquareBoxTx = await signTx(spendSquareBoxTx, POOL_MNEMONIC);
	});
});
