import {Activity} from "../../classes/module";
import {ZkSyncActivity} from "../blockchain_modules";
import {
    zkSyncSwapCycleNativeToUsdc_swapback,
    zkSyncSwapCycleNativeToUsdc_swapto,
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
        zkSyncSwapCycleNativeToUsdc_swapto, zkSyncSwapCycleNativeToUsdc_swapback
    ]
}
