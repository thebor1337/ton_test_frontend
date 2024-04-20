import { useEffect, useState } from "react";
import { MainContract } from "../contracts/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const contractAddress = "kQDe5DuUkZ-uJaujFAruiFu1uYqz9954SXpYJbcc3RTy5rLz"

export function useMainContract() {
	const client = useTonClient();
    const { sender } = useTonConnect();

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	const [contractData, setContractData] = useState<null | {
		counter_value: number;
		recent_sender: Address;
		owner_address: Address;
	}>();

	const [balance, setBalance] = useState<null | number>(0);

	const mainContract = useAsyncInitialize(async () => {
		if (!client) return;
		const contract = new MainContract(
			Address.parse(contractAddress)
		);
		return client.open(contract) as OpenedContract<MainContract>;
	}, [client]);

	useEffect(() => {
		async function getValue() {
			if (!mainContract) return;
			setContractData(null);
			const val = await mainContract.getData();
			const { balance } = await mainContract.getBalance();
			setContractData({
				counter_value: val.counter,
				recent_sender: val.recent_sender,
				owner_address: val.owner_address,
			});
			setBalance(balance);
            await sleep(5000);
            getValue();
		}
		getValue();
	}, [mainContract]);

	return {
		contract_address: mainContract?.address.toString(),
        contract_balance: balance,
		...contractData,
        sendIncrement: async () => {
            return mainContract?.sendIncrement(sender, toNano("0.05"), 5);
        },
        sendDeposit: async () => {
            return mainContract?.sendDeposit(sender, toNano("0.5"));
        },
        sendWithdraw: async () => {
            return mainContract?.sendWithdraw(sender, toNano("0.005"), toNano("0.055"));
        }
	};
}
