import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { fromNano } from "@ton/core";
import WebApp from "@twa-dev/sdk";

function App() {
	const {
		contract_address,
		contract_balance,
		counter_value,
		sendIncrement,
		sendDeposit,
		sendWithdraw,
	} = useMainContract();

	const { connected } = useTonConnect();

    const showAlert = () => {
        WebApp.showAlert("Hello from TWA!");
    };

	return (
		<div>
			<div>
				<TonConnectButton />
			</div>
			<div>
				<div className="Card">
					<b>{WebApp.platform}</b>
					<b>Our contract Address</b>
					<div className="Hint">
						{contract_address?.slice(0, 30) + "..."}
					</div>
					<b>Our contract Balance</b>
					<div className="Hint">
						{fromNano(contract_balance || 0)} TON
					</div>
				</div>

				<div className="Card">
					<b>Counter Value</b>
					<div>{counter_value ?? "Loading..."}</div>
				</div>

                <a onClick={showAlert}>Show Alert</a><br />

				{connected && (
					<div>
						<a onClick={() => sendIncrement()}>Increment by 5</a>
						<br />
						<a onClick={() => sendDeposit()}>Deposit 0.5 TON</a>
						<br />
						<a onClick={() => sendWithdraw()}>Withdraw</a>
						<br />
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
