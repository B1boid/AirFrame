# Modular Framework for EVM-Compatible Blockchains

## Overview
The framework provides a flexible and extensible solution for automating interactions across multiple EVM compatible blockchains. Whether you need to execute complex multichain operations, swap tokens, bridge assets, deploy smart contracts, or interact with DeFi protocols, this framework streamlines the process with ease.

## Features
- **Multi-Blockchain Support**: Easily interact with various EVM-compatible blockchains
- **Modular Design**: Extend functionality by adding new blockchain modules or contract integrations
- **Customizable Workflows**: Create complex strategies across multiple chains using variuos protocols and bridges
- **Seamless Contract Interactions**: Execute a wide range of blockchain operations or write new custom one

## How to Add a New Blockchain or Protocol
The framework is **designed to be modular**, allowing developers to add new blockchain modules or integrations:
1. Add information about blockchain to the [chains config](https://github.com/B1boid/AirFrame/blob/main/src/config/chains.ts)
2. Implement a new [module](https://github.com/B1boid/AirFrame/tree/main/src/module_blockchains) for the desired blockchain
3. Define interaction logic for the actions on this blockchain

## Supported Blockchains
The framework currently supports the following **EVM-compatible blockchains**:
- Ethereum
- Arbitrum
- Base
- BSC
- Optimism
- Scroll
- ZkSync
- Linea
- Polygon

Adding support for a new blockchain is as simple as creating a new module.

## Supported Smart Contract Interactions
### ERC-20 Token Swaps
The framework supports seamless token swaps with automatic approval support using various **DEX aggregators and AMMs**:
- 1inch
- Ambient
- LiFi
- Maverick
- Mute
- Odos
- PancakeSwap
- SpaceFi
- SyncSwap
- Velocore
- WooFi
- Zebra

### Other On-Chain Interactions
Beyond swaps, the framework enables users to automate interactions with various protocols:
- **Deploy Smart-Contracts**
- **Bridge to other Blockchains**
- **Mint Non-fungible-assets**
- **Vote or Delegate**
- **Wrap/Unwrap**
- **Lending & Borrowing**:
  - Aave
  - Zerolend
  - Layerbank
  - Paraspace
  - Kinza
- **Multi-Sig & Wallet Management**:
  - Safe
- **Decentralized Messaging & Identity**:
  - Dmail
  - ZnsId
- **Others**:
  - Tevaera
  - SynFutures
  - Blur


## Getting Started
To set up and start using the **Modular Automation Framework**, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/B1boid/AirFrame.git
   ```

2. Install dependencies:
   ```sh
   yarn install  # or npm install
   ```

3. Configure your `.env` file:
   - Add your **RPC endpoints** (format RPC_{chain_id}, e.g. RPC_42161 for Arbitrum)
   - Add your **Telegram** creds for logging (TELEGRAM_API_KEY, TELEGRAM_ERROR_CHANNEL_ID, TELEGRAM_SUPER_SUCCESS_CHANNEL_ID, TELEGRAM_WARN_CHANNEL_ID)

4. Configure your wallets in `.accs` and `.active_accs` file:
    - Each line corresponds to one wallet and its data is separated by commas:
    wallet_label,wallet_address,okx_deposit_address(optional),okx_account_label(optional),okx_subacc_label(optional),encrypted_private_key

5. Define workflow:
    - Choose worklow from available [presets](https://github.com/B1boid/AirFrame/blob/main/src/config/run_config.ts)
    - Or create new workflow by implementing [builder](https://github.com/B1boid/AirFrame/tree/main/src/builder) with custom logic 

6. Run workflow:
   ```sh
   yarn dev
   ```

