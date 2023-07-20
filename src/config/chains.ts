export interface Chain {
  title: string
  chainId: number
  nodeUrl: string
  symbol: string
  extraGasLimit: number

}

export enum Destination {
    zkSync = "zkSync",
    polygon = "Polygon",
    okx = "OKX"
}

const zkSyncChain: Chain = {
  title: Destination.zkSync,
  chainId: 324,
  nodeUrl: "https://mainnet.era.zksync.io",
  symbol: "ETH",
  extraGasLimit: 100000
}

const polygonChain: Chain = {
  title: Destination.polygon,
  chainId: 137,
  nodeUrl: "https://polygon.llamarpc.com",
  symbol: "MATIC",
  extraGasLimit: 100000
}

export {
  zkSyncChain,
  polygonChain
}
