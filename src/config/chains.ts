import {blockchainModules} from "../module_blockchains/blockchain_modules";

export interface Chain {
  title: Blockchains
  chainId: number
  nodeUrl: string
  symbol: string
  extraGasLimit: number
}
export enum Blockchains {
    ZkSync = "ZkSync",
    Polygon = "Polygon"
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
  extraGasLimit: 100000
}

export const polygonChain: Chain = {
  title: Blockchains.Polygon,
  chainId: 137,
  nodeUrl: "https://polygon.llamarpc.com",
  symbol: "MATIC",
  extraGasLimit: 100000
}

export const destToChain = (destination: Destination): Chain => {
    return blockchainModules[destination as Blockchains].chain
}