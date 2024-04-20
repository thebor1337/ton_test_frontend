import {
	Address,
	Cell,
	Contract,
	ContractProvider,
	SendMode,
	Sender,
	beginCell,
	contractAddress,
} from "@ton/core";

export type MainContractConfig = {
	number: number;
	address: Address;
    owner: Address;
};

export class MainContract implements Contract {
	constructor(
		readonly address: Address,
		readonly init?: {
			code: Cell;
			data: Cell;
		}
	) {}

	static createFromConfig(
		config: MainContractConfig,
		code: Cell,
		workchain = 0
	) {
		const data = beginCell()
            .storeUint(config.number, 32)
            .storeAddress(config.address)
            .storeAddress(config.owner)
            .endCell();
		const init = { code, data };
		const address = contractAddress(workchain, init);

		return new MainContract(address, init);
	}

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
          value,
          sendMode: SendMode.PAY_GAS_SEPARATELY,
          body: beginCell().endCell(),
        });
    }

	async sendIncrement(
		provider: ContractProvider,
		sender: Sender,
		value: bigint,
        increment_by: number
	) {
        const body = beginCell()
            .storeUint(1, 32) // op
            .storeUint(increment_by, 32) // increment_by
            .endCell();

		await provider.internal(sender, {
			value,
			sendMode: SendMode.PAY_GAS_SEPARATELY,
			body,
		});
	}

    async sendDeposit(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        const body = beginCell()
            .storeUint(2, 32) // op
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body,
        });
    }

    async sendDepositNoCode(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendWithdraw(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        amount: bigint
    ) {
        const body = beginCell()
            .storeUint(3, 32) // op
            .storeCoins(amount)
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body,
        });
    }

    async sendDestroy(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        const body = beginCell()
            .storeUint(4, 32) // op
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.CARRY_ALL_REMAINING_INCOMING_VALUE,
            body,
        });
    
    }

	async getData(provider: ContractProvider) {
		const { stack } = await provider.get("get_contract_storage_data", []);
		return {
			counter: stack.readNumber(),
            recent_sender: stack.readAddress(),
            owner_address: stack.readAddress()
		};
	}

    async getBalance(provider: ContractProvider) {
        const { stack } = await provider.get("balance", []);
        return {
            balance: stack.readNumber()
        };
    }
}
