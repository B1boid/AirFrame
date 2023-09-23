import {Activity} from "../../classes/module";
import {OptimismActivity} from "../blockchain_modules";
import {
    optAaveCycle_deposit,
    optAaveCycle_withdraw,
    optFakeUniExec_do,
    optGranaryCycle_deposit,
    optGranaryCycle_withdraw,
    optMoveDustGas_move,
    optOptimismDelegate_do,
    optRandomApprove_approve,
    optRandomStuff_do,
    optSwapCycleNativeToUsdc_swapback,
    optSwapCycleNativeToUsdc_swapto
} from "./interations";




export const optSwapCycleNativeToUsdc: Activity = {
    name: OptimismActivity.optSwapCycleNativeToUsdc,
    txs: [
        optSwapCycleNativeToUsdc_swapto,
        optSwapCycleNativeToUsdc_swapback
    ]
}

export const optRandomApprove: Activity = {
    name: OptimismActivity.optRandomApprove,
    txs: [
        optRandomApprove_approve
    ]
}

export const optAaveCycle: Activity = {
    name: OptimismActivity.optAaveCycle,
    txs: [
        optAaveCycle_deposit,
        optAaveCycle_withdraw
    ]
}

export const optGranaryCycle: Activity = {
    name: OptimismActivity.optGranaryCycle,
    txs: [
        optGranaryCycle_deposit,
        optGranaryCycle_withdraw
    ]
}


export const optMoveDustGas: Activity = {
    name: OptimismActivity.optMoveDustGas,
    txs: [
        optMoveDustGas_move
    ]
}

export const optFakeUniExec: Activity = {
    name: OptimismActivity.optFakeUniExec,
    txs: [
        optFakeUniExec_do
    ]
}

export const optRandomStuff: Activity = {
    name: OptimismActivity.optRandomStuff,
    txs: [
        optRandomStuff_do
    ]
}

export const optOptimismDelegate: Activity = {
    name: OptimismActivity.optOptimismDelegate,
    txs: [
        optOptimismDelegate_do
    ]
}

