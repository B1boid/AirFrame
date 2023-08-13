import {blockchainModules} from "../module_blockchains/blockchain_modules";

export interface Chain {
  title: Blockchains
  chainId: number
  nodeUrl: string
  symbol: string
  extraGasLimit: number
  orbiterCode?: number
}
export enum Blockchains {
    ZkSync = "ZkSync",
    Polygon = "Polygon",
    Ethereum = "Ethereum",
    Optimism = "Optimism"
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
  orbiterCode: 9014
}

export const polygonChain: Chain = {
  title: Blockchains.Polygon,
  chainId: 137,
  nodeUrl: "https://polygon.llamarpc.com",
  symbol: "MATIC",
  extraGasLimit: 100000,
  orbiterCode: 9006
}

export const ethereumChain: Chain = {
    title: Blockchains.Ethereum,
    chainId: 1,
    nodeUrl: "https://eth.llamarpc.com",
    symbol: "ETH",
    extraGasLimit: 100000,
    orbiterCode: 9001
}

export const optimismChain: Chain = {
    title: Blockchains.Optimism,
    chainId: 10,
    nodeUrl: "https://rpc.ankr.com/optimism",
    symbol: "ETH",
    extraGasLimit: 0,
    orbiterCode: 9007
}

export const destToChain = (destination: Destination): Chain => {
    return blockchainModules[destination as Blockchains].chain
}