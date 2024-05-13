import React, { useState } from "react";
import MyGroup from "./components/MyGroup.jsx";
import walletConnectFcn from "./components/hedera/walletConnect.js";
import contractDeployFcn from "./components/hedera/contractDeploy.js";
import "./styles/App.css";
import abi from "./contracts/abi.js";
import bytecode from "./contracts/bytecode.js";
import { ethers } from "ethers";

function App() {
	const [walletData, setWalletData] = useState();
	const [account, setAccount] = useState();
	const [network, setNetwork] = useState();
	const [contractAddress, setContractAddress] = useState();

	const [connectTextSt, setConnectTextSt] = useState("🔌 Connect here...");
	const [contractTextSt, setContractTextSt] = useState();
	const [executeTextSt, setExecuteTextSt] = useState();
	const [borrowTextSt, setBorrowTextSt] = useState();
	const [acceptBorrowTextSt, setAcceptBorrowTextSt] = useState();
	const [acceptLendTextSt, setAcceptLendTextSt] = useState();
	const [lendTextSt, setLendTextSt] = useState();
	const [acceptedTextSt, setAcceptedTextSt] = useState();
	const [closedBorrowTextSt, setClosedBorrowTextSt] = useState();
	const [closedLendTextSt, setClosedLendTextSt] = useState();
	const [openBorrowTextSt, setOpenBorrowTextSt] = useState();
	const [openLendTextSt, setOpenLendTextSt] = useState();

	const [connectLinkSt, setConnectLinkSt] = useState("");
	const [contractLinkSt, setContractLinkSt] = useState();
	const [executeLinkSt, setExecuteLinkSt] = useState();
	const [borrowLinkSt, setBorrowLinkSt] = useState();
	const [lendLinkSt, setLendLinkSt] = useState();

	async function connectWallet() {
		if (account !== undefined) {
			setConnectTextSt(`🔌 Account ${account} already connected ⚡ ✅`);
		} else {
			const wData = await walletConnectFcn();

			let newAccount = wData[0];
			let newNetwork = wData[2];
			if (newAccount !== undefined) {
				setConnectTextSt(`🔌 Account ${newAccount} connected ⚡ ✅`);
				setConnectLinkSt(`https://hashscan.io/${newNetwork}/account/${newAccount}`);

				setWalletData(wData);
				setAccount(newAccount);
				setNetwork(newNetwork);
				setContractTextSt();
				setBorrowTextSt();
				setLendTextSt();
			}
		}
	}

	async function contractDeploy() {
		if (account === undefined) {
			setContractTextSt("🛑 Connect a wallet first! 🛑");
		} else {
			const cAddress = await contractDeployFcn(walletData);

			if (cAddress === undefined) {
			} else {
				setContractAddress(cAddress);
				setContractTextSt(`Contract ${cAddress} deployed ✅`);
				setExecuteTextSt(``);
				setContractLinkSt(`https://hashscan.io/${network}/address/${cAddress}`);
			}
		}
	}

	async function createBorrowRequest() {
		if (contractAddress === undefined) {
			setBorrowTextSt("🛑 Contract not deployed yet! 🛑");
			return;
		}

		const amount = parseInt(prompt("Enter the amount needed for borrow request (INR):"));
		const timeInMonths = parseInt(prompt("Enter the time duration for borrow request (months):"));
		const annualInterestRate = parseInt(prompt("Enter the annual interest rate for borrow request (%):"));
		const acceptCode = parseInt(prompt("Enter 4-digit accept code:"));
		const closeCode = parseInt(prompt("Enter 4-digit close code:"));
		const mobileNumber = parseInt(prompt("Enter 10-digit mobile number:"));

		if (isNaN(amount) || isNaN(timeInMonths) || isNaN(annualInterestRate) || isNaN(acceptCode) || isNaN(closeCode) || isNaN(mobileNumber)) {
			setBorrowTextSt("❌ Invalid input! Please enter numeric values.");
			return;
		}

		const provider = walletData[1];
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);
		let txHash;
		try {
			const tx = await contract.createBorrowRequest(amount, timeInMonths, annualInterestRate, acceptCode, closeCode, mobileNumber);
			const rx = await tx.wait();
			txHash = rx.transactionHash;
			setBorrowTextSt(`✅ Borrow request created successfully!`);
		} catch (error) {
			console.error("Error creating borrow request:", error);
			setBorrowTextSt(`❌ Error creating borrow request: ${error.message}`);
		}
	}

	async function createLendRequest() {
		if (contractAddress === undefined) {
			setLendTextSt("🛑 Contract not deployed yet! 🛑");
			return;
		}

		const amount = parseInt(prompt("Enter the amount available for lend request (INR):"));
		const timeInMonths = parseInt(prompt("Enter the time duration for lend request (months):"));
		const annualInterestRate = parseInt(prompt("Enter the annual interest rate for lend request (%):"));
		const acceptCode = parseInt(prompt("Enter 4-digit accept code:"));
		const closeCode = parseInt(prompt("Enter 4-digit close code:"));
		const mobileNumber = parseInt(prompt("Enter 10-digit mobile number:"));

		if (isNaN(amount) || isNaN(timeInMonths) || isNaN(annualInterestRate) || isNaN(acceptCode) || isNaN(closeCode) || isNaN(mobileNumber)) {
			setLendTextSt("❌ Invalid input! Please enter numeric values.");
			return;
		}

		const provider = walletData[1];
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);

		try {
			const tx = await contract.createLendRequest(amount, timeInMonths, annualInterestRate, acceptCode, closeCode, mobileNumber);
			await tx.wait();
			setLendTextSt(`✅ Lend request created successfully!`);
		} catch (error) {
			console.error("Error creating lend request:", error);
			setLendTextSt(`❌ Error creating lend request: ${error.message}`);
		}
	}

	async function viewOpenBorrowRequests() {
		// Function to fetch and display open borrow requests
		if (contractAddress === undefined) {
			setBorrowTextSt("🛑 Contract not deployed yet! 🛑");
			return;
		}

		const provider = walletData[1];
		const contract = new ethers.Contract(contractAddress, abi, provider);

		try {
			const borrowRequests = await contract.getOpenBorrowRequests();

			let requestsInfo = [];
			borrowRequests.forEach((request, index) => {

				if (!request.accepted) {

					const requestInfo = `Request ${index + 1}: Amount: ${request.amount} INR, Duration: ${request.timeInMonths} months, Interest Rate: ${request.annualInterestRate}%, Contact Number: ${request.mobileNumber},Requester: ${request.requester}, is Accepted?: ${request.accepted}`;
					const acceptButton = <button onClick={() => acceptBorrowRequest(index, 'borrow')}>Accept</button>;
					requestsInfo.push(
						<div key={index}>
							<p>{requestInfo}</p>
							{acceptButton}
						</div>
					);
				}
			});


			setOpenBorrowTextSt(requestsInfo);
		} catch (error) {
			console.error("Error viewing borrow requests:", error);
			setBorrowTextSt(`❌ Error viewing borrow requests: ${error.message}`);
		}
	}


	async function acceptBorrowRequest(index, type) {
		// Function to accept the request based on its index and type (borrow/lend)
		const contract = new ethers.Contract(contractAddress, abi, walletData[1].getSigner());
		const acceptCode = prompt("Enter the accept code (4 digits):");

		if (!acceptCode || acceptCode.length !== 4 || isNaN(acceptCode)) {
			alert("Please enter a valid 4-digit accept code.");
			return;
		}

		try {
			if (type === 'borrow') {
				await contract.acceptBorrowRequest(index, parseInt(acceptCode));
				// setBorrowTextSt(prevText => prevText.replace("Accept", "Accepted"));
				setAcceptedTextSt('Request accepted successfully');
			} else {
				// Implement the similar functionality for accepting lend requests
			}
		} catch (error) {
			console.error("Error accepting request:", error);
			alert(`Error accepting request: ${error.message}`);
		}
	}


	async function viewOpenLendRequests() {
		if (contractAddress === undefined) {
			setLendTextSt("🛑 Contract not deployed yet! 🛑");
			return;
		}

		const provider = walletData[1];
		const contract = new ethers.Contract(contractAddress, abi, provider);

		try {
			const openLendRequests = await contract.getOpenLendRequests();

			let requestsInfo = [];
			openLendRequests.forEach((request, index) => {

				if (!request.accepted) {
					
					const requestInfo = (`Request ${index + 1}: Amount: ${request.amount} INR, Duration: ${request.timeInMonths} months, Interest Rate: ${request.annualInterestRate}%,  Contact Number: ${request.mobileNumber},Requester: ${request.requester}, is Accepted?: ${request.accepted}`);
					const acceptButton = <button onClick={() => acceptLendRequest(index, 'lend')}>Accept</button>;
					requestsInfo.push(
						<div key={index}>
							<p>{requestInfo}</p>
							{acceptButton}
						</div>
					);
				}
			});
			setOpenLendTextSt(requestsInfo);
		} catch (error) {
			console.error("Error viewing lend requests:", error);
			setLendTextSt(`❌ Error viewing lend requests: ${error.message}`);
		}
	}

	async function acceptLendRequest(index, type) {
		// Function to accept the request based on its index and type (borrow/lend)
		const contract = new ethers.Contract(contractAddress, abi, walletData[1].getSigner());
		const acceptCode = prompt("Enter the accept code (4 digits):");

		if (!acceptCode || acceptCode.length !== 4 || isNaN(acceptCode)) {
			alert("Please enter a valid 4-digit accept code.");
			return;
		}

		try {
			if (type === 'lend') {
				await contract.acceptLendRequest(index, parseInt(acceptCode));
				// setBorrowTextSt(prevText => prevText.replace("Accept", "Accepted"));
				setAcceptedTextSt('Request accepted successfully');
			} else {
				// Implement the similar functionality for accepting lend requests
			}
		} catch (error) {
			console.error("Error accepting request:", error);
			alert(`Error accepting request: ${error.message}`);
		}
	}

	async function viewAcceptedBorrowRequests() {
		// Function to fetch and display open borrow requests
		if (contractAddress === undefined) {
			setBorrowTextSt("🛑 Contract not deployed yet! 🛑");
			return;
		}

		const provider = walletData[1];
		const contract = new ethers.Contract(contractAddress, abi, provider);

		try {
			const acceptedBorrowRequests = await contract.getAcceptedBorrowRequests();

			let requestsInfo = [];
			acceptedBorrowRequests.forEach((request, index) => {
				if (!request.closed) {
					const requestInfo = `Request ${index + 1}: Amount: ${request.amount} INR, Duration: ${request.timeInMonths} months, Interest Rate: ${request.annualInterestRate}%, Contact Number: ${request.mobileNumber}, Requester: ${request.requester}, is Accepted?: ${request.accepted}, is Closed?: ${request.closed}`;
					const closeButton = <button onClick={() => closeBorrowRequest(index, 'borrow')}>Close</button>;
					requestsInfo.push(
						<div key={index}>
							<p>{requestInfo}</p>
							{closeButton}
						</div>
					);
				}
			});
			setAcceptBorrowTextSt(requestsInfo);
		} catch (error) {
			console.error("Error viewing accepted borrow requests:", error);
			setBorrowTextSt(`❌ Error viewing accepted borrow requests: ${error.message}`);
		}
	}


	async function closeBorrowRequest(index, type) {
		// Function to accept the request based on its index and type (borrow/lend)
		const contract = new ethers.Contract(contractAddress, abi, walletData[1].getSigner());
		const acceptCode = prompt("Enter the close code (4 digits):");

		if (!acceptCode || acceptCode.length !== 4 || isNaN(acceptCode)) {
			alert("Please enter a valid 4-digit accept code.");
			return;
		}

		try {
			if (type === 'borrow') {
				await contract.closeBorrowRequest(index, parseInt(acceptCode));
				// setBorrowTextSt(prevText => prevText.replace("Accept", "Accepted"));
				setAcceptedTextSt('Request closed successfully');
				<MyGroup text={acceptedTextSt} />
			} else {
				// Implement the similar functionality for accepting lend requests
			}
		} catch (error) {
			console.error("Error accepting request:", error);
			alert(`Error accepting request: ${error.message}`);
		}
	}


	async function viewAcceptedLendRequests() {
		if (contractAddress === undefined) {
			setLendTextSt("🛑 Contract not deployed yet! 🛑");
			return;
		}

		const provider = walletData[1];
		const contract = new ethers.Contract(contractAddress, abi, provider);

		try {
			const acceptedLendRequests = await contract.getAcceptedLendRequests();

			let requestsInfo = [];
			acceptedLendRequests.forEach((request, index) => {
				if (!request.closed) {

					const requestInfo = `Request ${index + 1}: Amount: ${request.amount} INR, Duration: ${request.timeInMonths} months, Interest Rate: ${request.annualInterestRate}%, Contact Number: ${request.mobileNumber}, Requester: ${request.requester},  is Accepted?: ${request.accepted}, is Closed?: ${request.closed}`;
					const closeButton = <button onClick={() => closeLendRequest(index, 'lend')}>Close</button>;
					requestsInfo.push(
						<div key={index}>
							<p>{requestInfo}</p>
							{closeButton}
						</div>
					);
				}	
			});
			setAcceptLendTextSt(requestsInfo);
		} catch (error) {
			console.error("Error viewing accepted lend requests:", error);
			setLendTextSt(`❌ Error viewing accepted lend requests: ${error.message}`);
		}
	}

	async function closeLendRequest(index, type) {
		// Function to accept the request based on its index and type (borrow/lend)
		const contract = new ethers.Contract(contractAddress, abi, walletData[1].getSigner());
		const acceptCode = prompt("Enter the close code (4 digits):");

		if (!acceptCode || acceptCode.length !== 4 || isNaN(acceptCode)) {
			alert("Please enter a valid 4-digit accept code.");
			return;
		}

		try {
			if (type === 'lend') {
				await contract.closeLendRequest(index, parseInt(acceptCode));
				// setBorrowTextSt(prevText => prevText.replace("Accept", "Accepted"));
				setAcceptedTextSt('Request closed successfully');
				<MyGroup text={acceptedTextSt} />
			} else {
				// Implement the similar functionality for accepting lend requests
			}
		} catch (error) {
			console.error("Error accepting request:", error);
			alert(`Error accepting request: ${error.message}`);
		}
	}

	async function viewClosedBorrowRequests() {
		if (contractAddress === undefined) {
			setBorrowTextSt("🛑 Contract not deployed yet! 🛑");
			return;
		}

		const provider = walletData[1];
		const contract = new ethers.Contract(contractAddress, abi, provider);

		try {
			const closedBorrowRequests = await contract.getClosedBorrowRequests();
			let requestsInfo = [];
			closedBorrowRequests.forEach((request, index) => {
				requestsInfo.push(`Request ${index + 1}: Amount: ${request.amount} INR, Duration: ${request.timeInMonths} months, Interest Rate: ${request.annualInterestRate}%, Contact Number: ${request.mobileNumber},Requester: ${request.requester},  is Accepted?: ${request.accepted}, is Closed?: ${request.closed}`);
			});
			setClosedBorrowTextSt(requestsInfo.join("\n"));
		} catch (error) {
			console.error("Error viewing closed borrow requests:", error);
			setBorrowTextSt(`❌ Error viewing closed borrow requests: ${error.message}`);
		}
	}

	async function viewClosedLendRequests() {
		if (contractAddress === undefined) {
			setLendTextSt("🛑 Contract not deployed yet! 🛑");
			return;
		}

		const provider = walletData[1];
		const contract = new ethers.Contract(contractAddress, abi, provider);

		try {
			const closedLendRequests = await contract.getClosedLendRequests();
			let requestsInfo = [];
			closedLendRequests.forEach((request, index) => {
				requestsInfo.push(`Request ${index + 1}: Amount: ${request.amount} INR, Duration: ${request.timeInMonths} months, Interest Rate: ${request.annualInterestRate}%, Contact Number: ${request.mobileNumber},Requester: ${request.requester},  is Accepted?: ${request.accepted}, is Closed?: ${request.closed}`);
			});
			setClosedLendTextSt(requestsInfo.join("\n"));
		} catch (error) {
			console.error("Error viewing closed lend requests:", error);
			setLendTextSt(`❌ Error viewing closed lend requests: ${error.message}`);
		}
	}

	return (
		<div className="App">
			<h1 className="header green-header">Peer-to-Peer Lending and Borrowing dApp on Hedera!</h1>
			<MyGroup fcn={connectWallet} buttonLabel={"Connect Wallet"} text={connectTextSt} link={connectLinkSt} />
			<MyGroup fcn={contractDeploy} buttonLabel={"Deploy Contract"} text={contractTextSt} link={contractLinkSt} />
			<MyGroup fcn={createBorrowRequest} buttonLabel={"Create Borrow Request"} text={borrowTextSt} link={borrowLinkSt} />
			<MyGroup fcn={createLendRequest} buttonLabel={"Create Lend Request"} text={lendTextSt} link={lendLinkSt} />
			<MyGroup fcn={viewOpenBorrowRequests} buttonLabel={"View Open Borrow Requests"} text={openBorrowTextSt}/>
			<MyGroup fcn={viewOpenLendRequests} buttonLabel={"View Open Lend Requests"} text={openLendTextSt}/>
			<MyGroup fcn={viewAcceptedBorrowRequests} buttonLabel={"View Accepted Borrow Requests"} text={acceptBorrowTextSt} />
			<MyGroup fcn={viewAcceptedLendRequests} buttonLabel={"View Accepted Lend Requests"}  text={acceptLendTextSt}  />
			<MyGroup fcn={viewClosedBorrowRequests} buttonLabel={"View Closed Borrow Requests"} text={closedBorrowTextSt}/>
			<MyGroup fcn={viewClosedLendRequests} buttonLabel={"View Closed Lend Requests"} text={closedLendTextSt}/>
			<div className="logo">
				<div className="symbol">
					<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
						<path d="M20 0a20 20 0 1 0 20 20A20 20 0 0 0 20 0" className="circle"></path>
						<path d="M28.13 28.65h-2.54v-5.4H14.41v5.4h-2.54V11.14h2.54v5.27h11.18v-5.27h2.54zm-13.6-7.42h11.18v-2.79H14.53z" className="h"></path>
					</svg>
				</div>
				<span>Hedera</span>
			</div>
		</div>
	);
}
export default App;
