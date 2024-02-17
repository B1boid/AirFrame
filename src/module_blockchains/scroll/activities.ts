import {Activity} from "../../classes/module";
import {ScrollActivity} from "../blockchain_modules";
import {
    scrollDeployAndInteract_deploy,
    scrollDeployAndInteract_interact,
    scrollDmail_send,
    scrollEmptyRouter_do,
    scrollOffMint_mint,
    scrollRandomApprove_approve,
    scrollRandomStuff_do,
    scrollSwapCycleNativeToUsdc_swapback,
    scrollSwapCycleNativeToUsdc_swapto,
    scrollSwapCycleNativeToWsteth_swapback, scrollSwapCycleNativeToWsteth_swapto,
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

export const scrollOffMint: Activity = {
    name: ScrollActivity.scrollOffMint,
    txs: [
        scrollOffMint_mint,
    ]
}


