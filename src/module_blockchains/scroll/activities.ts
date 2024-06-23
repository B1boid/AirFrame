import {Activity} from "../../classes/module";
import {ScrollActivity} from "../blockchain_modules";
import {
    scrollAaveCycle_deposit,
    scrollAaveCycle_withdraw, scrollAaveFull_deposit,
    scrollCreateSafe_do,
    scrollDeployAndInteract_deploy,
    scrollDeployAndInteract_interact,
    scrollDmail_send,
    scrollEmptyRouter_do,
    scrollLayerbankCycle_supply,
    scrollLayerbankCycle_withdraw,
    scrollOffMint_mint,
    scrollRandomApprove_approve,
    scrollRandomStuff_do, scrollSimpleSwap_do,
    scrollSwapCycleNativeToUsdc_swapback,
    scrollSwapCycleNativeToUsdc_swapto,
    scrollSwapCycleNativeToWsteth_swapback,
    scrollSwapCycleNativeToWsteth_swapto,
    scrollWrapUnwrap_unwrap,
    scrollWrapUnwrap_wrap
} from "./interations";


export const scrollRandomApprove: Activity = {
    name: ScrollActivity.scrollRandomApprove,
    txs: [
        scrollRandomApprove_approve
    ]
}

export const scrollRandomStuff: Activity = {
    name: ScrollActivity.scrollRandomStuff,
    txs: [
        scrollRandomStuff_do
    ]
}

export const scrollEmptyRouter: Activity = {
    name: ScrollActivity.scrollEmptyRouter,
    txs: [
        scrollEmptyRouter_do
    ]
}

export const scrollSimpleSwap: Activity = {
    name: ScrollActivity.scrollSimpleSwap,
    txs: [
        scrollSimpleSwap_do
    ]
}

export const scrollSwapCycleNativeToUsdc: Activity = {
    name: ScrollActivity.scrollSwapCycleNativeToUsdc,
    txs: [
        scrollSwapCycleNativeToUsdc_swapto,
        scrollSwapCycleNativeToUsdc_swapback
    ]
}

export const scrollSwapCycleNativeToWsteth: Activity = {
    name: ScrollActivity.scrollSwapCycleNativeToWsteth,
    txs: [
        scrollSwapCycleNativeToWsteth_swapto,
        scrollSwapCycleNativeToWsteth_swapback
    ]
}

export const scrollWrapUnwrap: Activity = {
    name: ScrollActivity.scrollWrapUnwrap,
    txs: [
        scrollWrapUnwrap_wrap,
        scrollWrapUnwrap_unwrap
    ]
}

export const scrollDmail: Activity = {
    name: ScrollActivity.scrollDmail,
    txs: [
        scrollDmail_send,
    ]
}

export const scrollDeployAndInteract: Activity = {
    name: ScrollActivity.scrollDeployAndInteract,
    txs: [
        scrollDeployAndInteract_deploy,
        scrollDeployAndInteract_interact
    ]
}

export const scrollInteractWithContract: Activity = {
    name: ScrollActivity.scrollInteractWithContract,
    txs: [
        scrollDeployAndInteract_interact
    ]
}

export const scrollOffMint: Activity = {
    name: ScrollActivity.scrollOffMint,
    txs: [
        scrollOffMint_mint,
    ]
}

export const scrollAaveCycle: Activity = {
    name: ScrollActivity.scrollAaveCycle,
    txs: [
        scrollAaveCycle_deposit,
        scrollAaveCycle_withdraw
    ]
}

export const scrollAaveFull: Activity = {
    name: ScrollActivity.scrollAaveFull,
    txs: [
        scrollAaveFull_deposit
    ]
}

export const scrollLayerbankCycle: Activity = {
    name: ScrollActivity.scrollLayerbankCycle,
    txs: [
        scrollLayerbankCycle_supply,
        scrollLayerbankCycle_withdraw
    ]
}

export const scrollCreateSafe: Activity = {
    name: ScrollActivity.scrollCreateSafe,
    txs: [
        scrollCreateSafe_do
    ]
}


