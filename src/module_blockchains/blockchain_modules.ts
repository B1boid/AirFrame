import {moduleZkSync} from "./zksync/zksync";
import {BlockchainModule} from "../classes/module";
import {modulePolygon} from "./polygon/polygon";
import {EnumDictionary} from "../utils/utils";
import {Blockchains, Chain, Destination} from "../config/chains";
import {moduleEthereum} from "./ethereum/ethereum";
import {moduleOptimism} from "./optimism/optimism";
import {moduleArbitrum} from "./arbitrum/arbitrum";
import {moduleBsc} from "./bsc/bsc";
import {moduleScroll} from "./scroll/scroll";
import {moduleLinea} from "./linea/linea";
import {moduleBase} from "./base/base";


export const enum PolygonActivity {
    wrapUnwrap = "wrapUnwrap",
    polygonSwapCycleNativeToUsdc = "polygonSwapCycleNativeToUsdc",
}

export const enum ZkSyncActivity {
    wrapUnwrap = "wrapUnwrap",
    zkSyncSwapCycleNativeToUsdc = "zkSyncSwapCycleNativeToUsdc",
    zkSyncSwapCycleNativeToWsteth = "zkSyncSwapCycleNativeToWsteth",
    zkSyncTopSwapCycleNativeToUsdc = "zkSyncTopSwapCycleNativeToUsdc",
    zkSyncSwapCycleNativeToUsdcWithPaymaster = "zkSyncSwapCycleNativeToUsdcWithPaymaster",
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
    zkSyncDummyRandomSwapCycle = "zkSyncDummyRandomSwapCycle",
    zkSyncDummyRandomStuff = "zkSyncDummyRandomStuff",
    zkSyncDmail = "zkSyncDmail",
    zkSyncCreateSafe = "zkSyncCreateSafe",
    zkSyncZerolendCycle = "zkSyncZerolendCycle",
    zkSyncEmptyMulticall = "zkSyncEmptyMulticall",
    zkSyncRhinoDeposit = "zkSyncRhinoDeposit",
    zkSyncSimpleSwap = "zkSyncSimpleSwap",
    zkSyncPaymaster = "zkSyncPaymaster"
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

export const enum ArbActivity {
    arbSwapCycleNativeToUsdc = "arbSwapCycleNativeToUsdc",
    arbRandomApprove = "arbRandomApprove",
    arbAaveCycle = "arbAaveCycle",
    arbMoveDustGas = "arbMoveDustGas",
    arbFakeUniExec = "arbFakeUniExec",
    arbRandomStuff = "arbRandomStuff",
    arbArbitrumDelegate = "arbArbitrumDelegate",
    arbFriendsTech = "arbFriendsTech"
}

export const enum ScrollActivity {
    scrollRandomApprove = "scrollRandomApprove",
    scrollRandomStuff = "scrollRandomStuff",
    scrollEmptyRouter = "scrollEmptyRouter",
    scrollSwapCycleNativeToUsdc = "scrollSwapCycleNativeToUsdc",
    scrollWrapUnwrap = "scrollWrapUnwrap",
    scrollDmail = "scrollDmail",
    scrollDeployAndInteract = "scrollDeployAndInteract",
    scrollOffMint = "scrollOffMint",
    scrollSwapCycleNativeToWsteth = "scrollSwapCycleNativeToWsteth",
    scrollAaveCycle = "scrollAaveCycle",
    scrollLayerbankCycle = "scrollLayerbankCycle",
    scrollCreateSafe = "scrollCreateSafe",
    scrollInteractWithContract = "scrollInteractWithContract",

    scrollDummyLendingCycle = "scrollDummyLendingCycle",
    scrollDummySwapCycle = "scrollDummySwapCycle",
    scrollSimpleSwap = "scrollSimpleSwap",
    scrollAaveFull = "scrollAaveFull",
    scrollLayerbankFull = "scrollLayerbankFull",
    scrollAaveWithdraw = "scrollAaveWithdraw",
    scrollLayerbankWithdraw = "scrollLayerbankWithdraw",
}

export const enum LineaActivity {
    lineaSwapEthToWst = "lineaSwapEthToWst"
}

export const enum BaseActivity {
    wrapUnwrap = "wrapUnwrap"
}

export type ActivityTag = PolygonActivity | ZkSyncActivity | EthereumActivity | OptimismActivity | BscActivity | ArbActivity | ScrollActivity | LineaActivity | BaseActivity

export const blockchainModules: EnumDictionary<Blockchains, BlockchainModule> = {
    [Blockchains.ZkSync]: moduleZkSync,
    [Blockchains.Polygon]: modulePolygon,
    [Blockchains.Ethereum]: moduleEthereum,
    [Blockchains.Optimism]: moduleOptimism,
    [Blockchains.Arbitrum]: moduleArbitrum,
    [Blockchains.Bsc]: moduleBsc,
    [Blockchains.Scroll]: moduleScroll,
    [Blockchains.Linea]: moduleLinea,
    [Blockchains.Base]: moduleBase
}

export const destToChain = (destination: Destination): Chain => {
    return blockchainModules[destination as Blockchains].chain
}
