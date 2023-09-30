import {Activity} from "../../classes/module";
import {ArbActivity, OptimismActivity} from "../blockchain_modules";
import {
    arbAaveCycle_deposit,
    arbAaveCycle_withdraw,
    arbArbitrumDelegate_do,
    arbFakeUniExec_do,
    arbFriendsTech_buy,
    arbMoveDustGas_move,
    arbRandomApprove_approve,
    arbRandomStuff_do,
    arbSwapCycleNativeToUsdc_swapback,
    arbSwapCycleNativeToUsdc_swapto
} from "./interations";

export const arbSwapCycleNativeToUsdc: Activity = {
    name: ArbActivity.arbSwapCycleNativeToUsdc,
    txs: [
        arbSwapCycleNativeToUsdc_swapto,
        arbSwapCycleNativeToUsdc_swapback
    ]
}

export const arbRandomApprove: Activity = {
    name: ArbActivity.arbRandomApprove,
    txs: [
        arbRandomApprove_approve
    ]
}

export const arbAaveCycle: Activity = {
    name: ArbActivity.arbAaveCycle,
    txs: [
        arbAaveCycle_deposit,
        arbAaveCycle_withdraw
    ]
}

export const arbMoveDustGas: Activity = {
    name: ArbActivity.arbMoveDustGas,
    txs: [
        arbMoveDustGas_move
    ]
}

export const arbFakeUniExec: Activity = {
    name: ArbActivity.arbFakeUniExec,
    txs: [
        arbFakeUniExec_do
    ]
}

export const arbRandomStuff: Activity = {
    name: ArbActivity.arbRandomStuff,
    txs: [
        arbRandomStuff_do
    ]
}

export const arbArbitrumDelegate: Activity = {
    name: ArbActivity.arbArbitrumDelegate,
    txs: [
        arbArbitrumDelegate_do
    ]
}

export const arbFriendsTech: Activity = {
    name: ArbActivity.arbFriendsTech,
    txs: [
        arbFriendsTech_buy
    ]
}

