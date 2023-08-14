import {Activity} from "../../classes/module";
import {EthereumActivity} from "../blockchain_modules";
import {
    ethBlurCycle_deposit, ethBlurCycle_withdraw,
    ethDepositToArbOfficial_deposit,
    ethDepositToZkLite_deposit, ethMoveDustGas_move,
    ethRandomApprove_approve,
    ethRandomMint_mint, ethRandomStuff_do,
    ethWrapUnwrap_unwrap,
    ethWrapUnwrap_wrap
} from "./interations";

export const ethWrapUnwrap: Activity = {
    name: EthereumActivity.wrapUnwrap,
    txs: [
        ethWrapUnwrap_wrap,
        ethWrapUnwrap_unwrap
    ]
}

export const ethRandomApprove: Activity = {
    name: EthereumActivity.ethRandomApprove,
    txs: [
        ethRandomApprove_approve
    ]
}

export const ethRandomMint: Activity = {
    name: EthereumActivity.ethRandomMint,
    txs: [
        ethRandomMint_mint
    ]
}

export const ethDepositToZkLite: Activity = {
    name: EthereumActivity.ethDepositToZkLite,
    txs: [
        ethDepositToZkLite_deposit
    ]
}

export const ethDepositToArbOfficial: Activity = {
    name: EthereumActivity.ethDepositToArbOfficial,
    txs: [
        ethDepositToArbOfficial_deposit
    ]
}

export const ethBlurCycle: Activity = {
    name: EthereumActivity.ethBlurCycle,
    txs: [
        ethBlurCycle_deposit,
        ethBlurCycle_withdraw
    ]
}

export const ethMoveDustGas: Activity = {
    name: EthereumActivity.ethMoveDustGas,
    txs: [
        ethMoveDustGas_move
    ]
}

export const ethRandomStuff: Activity = {
    name: EthereumActivity.ethRandomStuff,
    txs: [
        ethRandomStuff_do
    ]
}
