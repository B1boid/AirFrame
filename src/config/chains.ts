import {Blockchains} from "../module_blockchains/blockchain_modules";

export interface Chain {
  title: Destination
  chainId: number
  nodeUrl: string
  symbol: string
  extraGasLimit: number
}

export enum Destination {
    ZkSync = Blockchains.ZkSync,
    Polygon = Blockchains.Polygon,
    OKX = "OKX"
}

const zkSyncChain: Chain = {
  title: Destination.ZkSync,
  chainId: 324,
  nodeUrl: "https://mainnet.era.zksync.io",
  symbol: "ETH",
  extraGasLimit: 100000
}

const polygonChain: Chain = {
  title: Destination.Polygon,
  chainId: 137,
  nodeUrl: "https://polygon.llamarpc.com",
  symbol: "MATIC",
  extraGasLimit: 100000
}

const destToChain = new Map<Destination, Chain>([
      [Destination.Polygon, polygonChain],
      [Destination.ZkSync, zkSyncChain]
    ]
)

export {
  zkSyncChain,
  polygonChain,
  destToChain
}
