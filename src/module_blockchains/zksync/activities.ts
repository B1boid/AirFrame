import {Activity} from "../../classes/module";
import {ZkSyncActivity} from "../blockchain_modules";
import {
    zkSyncCreateSafe_do,
    zkSyncDmail_send,
    zkSyncEmptyMulticall_do,
    zkSyncEraLendCycle_supply,
    zkSyncEraLendCycle_withdraw,
    zkSyncEraLendInit_enter,
    zkSyncMintTevaera_buyid,
    zkSyncMintTevaera_mint,
    zkSyncMintZnsId_mint,
    zkSyncParaspaceCycle_supply,
    zkSyncRandomApprove_approve,
    zkSyncReactFusionCycle_supply,
    zkSyncReactFusionCycle_withdraw,
    zkSyncReactFusionInit_enter,
    zkSyncRhinoCycle_deposit,
    zkSyncSimpleSwap_do,
    zkSyncSwapCycleNativeToUsdc_swapback,
    zkSyncSwapCycleNativeToUsdc_swapto,
    zkSyncSwapCycleNativeToWsteth_swapback,
    zkSyncSwapCycleNativeToWsteth_swapto, zkSyncSwapPaymaster_do,
    zkSyncSynFuturesTest_mint,
    zkSyncTopSwapCycleNativeToUsdc_swapback,
    zkSyncTopSwapCycleNativeToUsdc_swapto,
    zkSyncWrapUnwrap_unwrap,
    zkSyncWrapUnwrap_wrap,
    zkSyncZerolendCycle_deposit,
    zkSyncZerolendCycle_withdraw
} from "./interations";


export const zkSyncWrapUnwrap: Activity = {
    name: ZkSyncActivity.wrapUnwrap,
    txs: [
        zkSyncWrapUnwrap_wrap,
        zkSyncWrapUnwrap_unwrap
    ]
}

export const zkSyncSimpleSwap: Activity = {
    name: ZkSyncActivity.zkSyncSimpleSwap,
    txs: [
        zkSyncSimpleSwap_do
    ]
}

export const zkSyncPaymaster: Activity = {
    name: ZkSyncActivity.zkSyncPaymaster,
    txs: [
        zkSyncSwapPaymaster_do
    ]
}

export const zkSyncSwapCycleNativeToUsdc: Activity = {
    name: ZkSyncActivity.zkSyncSwapCycleNativeToUsdc,
    txs: [
        zkSyncSwapCycleNativeToUsdc_swapto,
        zkSyncSwapCycleNativeToUsdc_swapback
    ]
}

export const zkSyncSwapCycleNativeToUsdcWithPaymaster: Activity = {
    name: ZkSyncActivity.zkSyncSwapCycleNativeToUsdcWithPaymaster,
    txs: [
        zkSyncSwapCycleNativeToUsdc_swapto,
        zkSyncSwapPaymaster_do,
        zkSyncSwapCycleNativeToUsdc_swapback
    ]
}


export const zkSyncSwapCycleNativeToWsteth: Activity = {
    name: ZkSyncActivity.zkSyncSwapCycleNativeToWsteth,
    txs: [
        zkSyncSwapCycleNativeToWsteth_swapto,
        zkSyncSwapCycleNativeToWsteth_swapback
    ]
}

export const zkSyncTopSwapCycleNativeToUsdc: Activity = {
    name: ZkSyncActivity.zkSyncTopSwapCycleNativeToUsdc,
    txs: [
        zkSyncTopSwapCycleNativeToUsdc_swapto,
        zkSyncTopSwapCycleNativeToUsdc_swapback
    ]
}

export const zkSyncMintTevaera: Activity = {
    name: ZkSyncActivity.zkSyncMintTevaera,
    txs: [
        zkSyncMintTevaera_buyid, zkSyncMintTevaera_mint
    ]
}

export const zkSyncMintZnsId: Activity = {
    name: ZkSyncActivity.zkSyncMintZnsId,
    txs: [
        zkSyncMintZnsId_mint
    ]
}

export const zkSyncRandomApprove: Activity = {
    name: ZkSyncActivity.zkSyncRandomApprove,
    txs: [
        zkSyncRandomApprove_approve
    ]
}

export const zkSyncEraLendInit: Activity = {
    name: ZkSyncActivity.zkSyncEraLendInit,
    txs: [
        zkSyncEraLendInit_enter
    ]
}

export const zkSyncEraLendCycle: Activity = {
    name: ZkSyncActivity.zkSyncEraLendCycle,
    txs: [
        zkSyncEraLendCycle_supply,
        zkSyncEraLendCycle_withdraw
    ]
}

export const zkSyncReactFusionInit: Activity = {
    name: ZkSyncActivity.zkSyncReactFusionInit,
    txs: [
        zkSyncReactFusionInit_enter
    ]
}

export const zkSyncReactFusionCycle: Activity = {
    name: ZkSyncActivity.zkSyncReactFusionCycle,
    txs: [
        zkSyncReactFusionCycle_supply,
        zkSyncReactFusionCycle_withdraw
    ]
}

export const zkSyncParaspaceCycle: Activity = {
    name: ZkSyncActivity.zkSyncParaspaceCycle,
    txs: [
        zkSyncParaspaceCycle_supply
    ]
}

export const zkSyncSynFuturesTest: Activity = {
    name: ZkSyncActivity.zkSyncSynFuturesTest,
    txs: [
        zkSyncSynFuturesTest_mint
    ]
}

export const zkSyncDmail: Activity = {
    name: ZkSyncActivity.zkSyncDmail,
    txs: [
        zkSyncDmail_send
    ]
}

export const zkSyncCreateSafe: Activity = {
    name: ZkSyncActivity.zkSyncCreateSafe,
    txs: [
        zkSyncCreateSafe_do
    ]
}

export const zkSyncZerolendCycle: Activity = {
    name: ZkSyncActivity.zkSyncZerolendCycle,
    txs: [
        zkSyncZerolendCycle_deposit,
        zkSyncZerolendCycle_withdraw
    ]
}

export const zkSyncEmptyMulticall: Activity = {
    name: ZkSyncActivity.zkSyncEmptyMulticall,
    txs: [
        zkSyncEmptyMulticall_do
    ]
}

export const zkSyncRhinoDeposit: Activity = {
    name: ZkSyncActivity.zkSyncRhinoDeposit,
    txs: [
        zkSyncRhinoCycle_deposit
    ]
}