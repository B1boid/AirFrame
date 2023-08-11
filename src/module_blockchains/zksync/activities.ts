import {Activity} from "../../classes/module";
import {ZkSyncActivity} from "../blockchain_modules";
import {
    zkSyncEraLendCycle_supply,
    zkSyncEraLendCycle_withdraw,
    zkSyncEraLendInit_enter,
    zkSyncMintTevaera_buyid,
    zkSyncMintTevaera_mint,
    zkSyncMintZnsId_mint,
    zkSyncRandomApprove_approve,
    zkSyncReactFusionCycle_supply, zkSyncReactFusionCycle_withdraw, zkSyncReactFusionInit_enter,
    zkSyncSwapCycleNativeToUsdc_swapback,
    zkSyncSwapCycleNativeToUsdc_swapto, zkSyncSynFuturesTest_mint,
    zkSyncWrapUnwrap_unwrap,
    zkSyncWrapUnwrap_wrap
} from "./interations";



export const zkSyncWrapUnwrap: Activity = {
    name: ZkSyncActivity.wrapUnwrap,
    txs: [
        zkSyncWrapUnwrap_wrap,
        zkSyncWrapUnwrap_unwrap
    ]
}

export const zkSyncSwapCycleNativeToUsdc: Activity = {
    name: ZkSyncActivity.zkSyncSwapCycleNativeToUsdc,
    txs: [
        zkSyncSwapCycleNativeToUsdc_swapto,
        zkSyncSwapCycleNativeToUsdc_swapback
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

export const zkSyncSynFuturesTest: Activity = {
    name: ZkSyncActivity.zkSyncSynFuturesTest,
    txs: [
        zkSyncSynFuturesTest_mint
    ]
}