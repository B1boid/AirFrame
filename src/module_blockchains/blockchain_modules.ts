import {moduleZkSync} from "./zksync/zksync";
import {BlockchainModule} from "../classes/module";
import {modulePolygon} from "./polygon/polygon";
import {EnumDictionary} from "../utils/utils";
import {Blockchains, Chain, Destination} from "../config/chains";
import {moduleEthereum} from "./ethereum/ethereum";
import {moduleOptimism} from "./optimism/optimism";
import {moduleArbitrum} from "./arbitrum/arbitrum";
import {moduleBsc} from "./bsc/bsc";


export const enum PolygonActivity {
    wrapUnwrap = "wrapUnwrap",
    polygonSwapCycleNativeToUsdc = "polygonSwapCycleNativeToUsdc",
}

export const enum ZkSyncActivity {
    wrapUnwrap = "wrapUnwrap",
    zkSyncSwapCycleNativeToUsdc = "zkSyncSwapCycleNativeToUsdc",
    zkSyncTopSwapCycleNativeToUsdc = "zkSyncTopSwapCycleNativeToUsdc",
    zkSyncMintTevaera = "zkSyncMintTevaera",
    zkSyncMintZnsId = "zkSyncMintZnsId",
    zkSyncRandomApprove = "zkSyncRandomApprove",
    zkSyncEraLendInit = "zkSyncEraLendInit",
    zkSyncEraLendCycle = "zkSyncEraLendCycle",
    zkSyncReactFusionInit = "zkSyncReactFusionInit",
    zkSyncReactFusionCycle = "zkSyncReactFusionCycle",
    zkSyncParaspaceCycle = "zkSyncParaspaceCycle",
    zkSyncSynFuturesTest = "zkSyncSynFuturesTest",

    zkSyncDummyRandomLending = "zkSyncDummyRandomLending",
    zkSyncDummyRandomSwapCycle = "zkSyncDummyRandomSwapCycle"
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

export const enum OptimismActivity {
    optSwapCycleNativeToUsdc = "optSwapCycleNativeToUsdc",
    optRandomApprove = "optRandomApprove",
    optAaveCycle = "optAaveCycle",
    optMoveDustGas = "optMoveDustGas",
    optFakeUniExec = "optFakeUniExec",
    optRandomStuff = "optRandomStuff",
    optOptimismDelegate = "optOptimismDelegate",
    optGranaryCycle = "optGranaryCycle",
    optDummyLendingCycle = "optDummyLendingCycle"
}

export const enum BscActivity {
    bscRandomApprove = "bscRandomApprove",
    bscKinzaCycle = "bscKinzaCycle"
}

export type ActivityTag = PolygonActivity | ZkSyncActivity | EthereumActivity | OptimismActivity | BscActivity

export const blockchainModules: EnumDictionary<Blockchains, BlockchainModule> = {
    [Blockchains.ZkSync]: moduleZkSync,
    [Blockchains.Polygon]: modulePolygon,
    [Blockchains.Ethereum]: moduleEthereum,
    [Blockchains.Optimism]: moduleOptimism,
    [Blockchains.Arbitrum]: moduleArbitrum,
    [Blockchains.Bsc]: moduleBsc
}

export const destToChain = (destination: Destination): Chain => {
    return blockchainModules[destination as Blockchains].chain
}
