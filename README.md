# Splitwise DApp

## Getting Started

This project is a decentralized application (DApp) built with Solidity and JavaScript, designed to manage shared expenses among a group of people. It uses the Hardhat framework for development, testing, and deployment.

### Prerequisites

- Node.js and npm
- Hardhat
- Infura account for deploying to the Sepolia test network

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd splitwise-web3
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Create a `.env` file in the root directory and add your Infura API key and Sepolia private key:

   ```env
   INFURA_API_KEY=your_infura_api_key
   SEPOLIA_PRIVATE_KEY=your_sepolia_private_key
   ```

2. Compile the smart contracts:

   ```bash
   npm run compile
   ```

3. Run tests for the smart contracts:
   ```bash
   npm test
   ```

### Deployment

1. Deploy the smart contract to the Sepolia test network:

   ```bash
   npm run deploy-contract
   ```

2. After deployment, you will receive the contract address. You need to manually update this address in the `ContractContext.jsx` file located in the `context` directory.

   Open `context/ContractContext.jsx` and update the contract address variable with the new address.

## Project Overview and Usage

This decentralized application manages shared expenses using blockchain technology. It allows users to create expenses, add members, track balances, manage payments, and participate in a token reward system for timely settlements.

### How to Use It

1. **Connect Wallet**: Ensure your Ethereum wallet is connected to interact with the application.

2. **Create Expense**: Navigate to the Expense Form where you can input the expense details, including description, total amount, interest rate, and add members involved in the expense.

3. **Add Members**: Specify the members involved in the expense. The application will automatically calculate the equal split among all participants.

4. **Check Expenses**: Use the Expense Page to view all expenses you are involved in. You can filter to see only those that are unsettled or settled.

5. **Pay Expenses**: Select the expenses you wish to settle and proceed with the payment. The application will handle the distribution of funds to the respective members.

6. **Reward System**: Access the Rewards Page to view your token balance. Tokens are awarded for participating in expense management and settling expenses promptly.

### Key Features

- **Expense Creation**: Users can create an expense specifying the involved members, amounts owed, and an optional interest rate.
- **Token Rewards**: Users are rewarded with tokens for settling expenses promptly.
- **Balance Management**: The contract maintains a balance for each user, representing the net amount they owe or are owed.

### Testing

The project includes a suite of tests written in JavaScript using the Chai assertion library. These tests verify the correct functionality of the contract's features, such as expense creation and balance updates.

## Technologies Used

- **Solidity**: For writing smart contracts.
- **Hardhat**: Development environment for compiling, testing, and deploying smart contracts.
- **Next.js**: Framework for building the frontend.
- **React**: JavaScript library for building user interfaces.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.
- **Chai**: Assertion library for testing.
