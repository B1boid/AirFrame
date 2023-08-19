import {moduleZkSync} from "./zksync/zksync";
import {BlockchainModule} from "../classes/module";
import {modulePolygon} from "./polygon/polygon";
import {EnumDictionary} from "../utils/utils";
import {Blockchains, Chain, Destination} from "../config/chains";
import {moduleEthereum} from "./ethereum/ethereum";
import {moduleOptimism} from "./optimism/optimism";


export const enum PolygonActivity {
    wrapUnwrap = "wrapUnwrap",
    polygonSwapCycleNativeToUsdc = "polygonSwapCycleNativeToUsdc",
}

export const enum ZkSyncActivity {
    wrapUnwrap = "wrapUnwrap",
    zkSyncSwapCycleNativeToUsdc = "zkSyncSwapCycleNativeToUsdc",
    zkSyncMintTevaera = "zkSyncMintTevaera",
    zkSyncMintZnsId = "zkSyncMintZnsId",
    zkSyncRandomApprove = "zkSyncRandomApprove",
    zkSyncEraLendInit = "zkSyncEraLendInit",
    zkSyncEraLendCycle = "zkSyncEraLendCycle",
    zkSyncReactFusionInit = "zkSyncReactFusionInit",
    zkSyncReactFusionCycle = "zkSyncReactFusionCycle",
    zkSyncParaspaceCycle = "zkSyncParaspaceCycle",
    zkSyncSynFuturesTest = "zkSyncSynFuturesTest",
    zkSyncDummyRandomLending = "zkSyncDummyRandomLending"
}

export const enum EthereumActivity {
    wrapUnwrap = "wrapUnwrap",
    ethRandomApprove = "ethRandomApprove",
    ethRandomMint = "ethRandomMint",
    ethDepositToZkLite = "ethDepositToZkLite",
    ethDepositToArbOfficial = "ethDepositToArbOfficial",
    ethBlurCycle = "ethBlurCycle",
    ethMoveDustGas = "ethMoveDustGas",
    ethRandomStuff = "ethRandomStuff",
    ethFakeUniExec = "ethFakeUniExec"

}

export type ActivityTag = PolygonActivity | ZkSyncActivity | EthereumActivity

export const blockchainModules: EnumDictionary<Blockchains, BlockchainModule> = {
    [Blockchains.ZkSync]: moduleZkSync,
    [Blockchains.Polygon]: modulePolygon,
    [Blockchains.Ethereum]: moduleEthereum,
    [Blockchains.Optimism]: moduleOptimism
}

export const destToChain = (destination: Destination): Chain => {
    return blockchainModules[destination as Blockchains].chain
}
