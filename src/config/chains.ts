import dotenv from "dotenv";
dotenv.config()

export interface Chain {
  title: Blockchains
  chainId: number
  nodeUrl: string
  symbol: string
  extraGasLimit: number
  explorerUrl: string
  nitroConnectionId: string
  orbiterCode?: number,
}
export enum Blockchains {
    ZkSync = "ZkSync",
    Polygon = "Polygon",
    Ethereum = "Ethereum",
    Optimism = "Optimism",
    Arbitrum = "Arbitrum",
    Bsc = "Bsc",
    Scroll = "Scroll",
    Linea = "Linea",
    Base = "Base"
}

enum Exchanges {
    OKX = "OKX"
}

export type Destination = Blockchains | Exchanges
export const Destination = {...Blockchains, ...Exchanges};


export const zkSyncChain: Chain = {
  title: Blockchains.ZkSync,
  chainId: 324,
  nodeUrl: `${process.env.RPC_ZK}`,
  symbol: "ETH",
  extraGasLimit: 100000,
  explorerUrl: "https://explorer.zksync.io",
  orbiterCode: 9014,
  nitroConnectionId: "324"
}

export const polygonChain: Chain = {
  title: Blockchains.Polygon,
  chainId: 137,
  nodeUrl: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  symbol: "MATIC",
  extraGasLimit: 100000,
  explorerUrl: "https://polygonscan.com",
  orbiterCode: 900,
  nitroConnectionId: "137"
}

export const ethereumChain: Chain = {
    title: Blockchains.Ethereum,
    chainId: 1,
    nodeUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    symbol: "ETH",
    extraGasLimit: 100000,
    explorerUrl: "https://etherscan.io",
    orbiterCode: 9001,
    nitroConnectionId: "1"
}

export const optimismChain: Chain = {
    title: Blockchains.Optimism,
    chainId: 10,
    nodeUrl: `${process.env.RPC_OPT}`,
    symbol: "ETH",
    extraGasLimit: 0,
    explorerUrl: "https://optimistic.etherscan.io",
    orbiterCode: 9007,
    nitroConnectionId: "10"
}

export const arbitrumChain: Chain = {
    title: Blockchains.Arbitrum,
    chainId: 42161,
    nodeUrl: `${process.env.RPC_ARB}`,
    symbol: "ETH",
    extraGasLimit: 0,
    explorerUrl: "https://arbiscan.io",
    orbiterCode: 9002,
    nitroConnectionId: "42161"
}

export const scrollChain: Chain = {
    title: Blockchains.Scroll,
    chainId: 534352,
    nodeUrl: "https://scroll.blockpi.network/v1/rpc/395f9c1e31a38063cdc8bdc919f2f9387865f758",
    symbol: "ETH",
    extraGasLimit: 50000,
    explorerUrl: "https://scrollscan.com",
    orbiterCode: 9019,
    nitroConnectionId: "534352"
}

export const bscChain: Chain = {
    title: Blockchains.Bsc,
    chainId: 56,
    nodeUrl: "https://rpc.ankr.com/bsc",
    symbol: "BNB",
    extraGasLimit: 0,
    explorerUrl: "https://bscscan.com",
    orbiterCode: 9015,
    nitroConnectionId: "56"
}

export const lineaChain: Chain = {
    title: Blockchains.Linea,
    chainId: 59144,
    nodeUrl: "https://1rpc.io/linea",
    symbol: "ETH",
    extraGasLimit: 0,
    explorerUrl: "https://lineascan.build",
    orbiterCode: -1,
    nitroConnectionId: "59144"
}

export const baseChain: Chain = {
    title: Blockchains.Base,
    chainId: 8453,
    nodeUrl: "https://base.blockpi.network/v1/rpc/69f0e1f00f5ef09d76b352676e931cbbe6c28e10",
    symbol: "ETH",
    extraGasLimit: 0,
    explorerUrl: "https://basescan.org",
    orbiterCode: 9021,
    nitroConnectionId: "8453"
}