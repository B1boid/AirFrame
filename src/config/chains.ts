import dotenv from "dotenv";
dotenv.config()

export interface Chain {
  title: Blockchains
  chainId: number
  nodeUrl: string
  symbol: string
  extraGasLimit: number
  explorerUrl: string
  orbiterCode?: number
}
export enum Blockchains {
    ZkSync = "ZkSync",
    Polygon = "Polygon",
    Ethereum = "Ethereum",
    Optimism = "Optimism",
    Arbitrum = "Arbitrum",
    Bsc = "Bsc",
    Scroll = "Scroll"
}

enum Exchanges {
    OKX = "OKX"
}

export type Destination = Blockchains | Exchanges
export const Destination = {...Blockchains, ...Exchanges};


export const zkSyncChain: Chain = {
  title: Blockchains.ZkSync,
  chainId: 324,
  nodeUrl: "https://mainnet.era.zksync.io",
  symbol: "ETH",
  extraGasLimit: 100000,
  explorerUrl: "https://explorer.zksync.io",
  orbiterCode: 9014
}

export const polygonChain: Chain = {
  title: Blockchains.Polygon,
  chainId: 137,
  nodeUrl: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  symbol: "MATIC",
  extraGasLimit: 100000,
  explorerUrl: "https://polygonscan.com",
  orbiterCode: 9006
}

export const ethereumChain: Chain = {
    title: Blockchains.Ethereum,
    chainId: 1,
    nodeUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    symbol: "ETH",
    extraGasLimit: 100000,
    explorerUrl: "https://etherscan.io",
    orbiterCode: 9001
}

export const optimismChain: Chain = {
    title: Blockchains.Optimism,
    chainId: 10,
    nodeUrl: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    symbol: "ETH",
    extraGasLimit: 0,
    explorerUrl: "https://optimistic.etherscan.io",
    orbiterCode: 9007
}

export const arbitrumChain: Chain = {
    title: Blockchains.Arbitrum,
    chainId: 42161,
    nodeUrl: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    symbol: "ETH",
    extraGasLimit: 0,
    explorerUrl: "https://arbiscan.io",
    orbiterCode: 9002
}

export const scrollChain: Chain = {
    title: Blockchains.Scroll,
    chainId: 534352,
    nodeUrl: 'https://rpc.scroll.io',
    symbol: "ETH",
    extraGasLimit: 0,
    explorerUrl: "https://scrollscan.com",
    orbiterCode: 9019
}

export const bscChain: Chain = {
    title: Blockchains.Bsc,
    chainId: 56,
    nodeUrl: "https://rpc.ankr.com/bsc",
    symbol: "BNB",
    extraGasLimit: 0,
    explorerUrl: "https://bscscan.com",
    orbiterCode: 9015
}