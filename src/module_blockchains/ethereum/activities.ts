import {Activity} from "../../classes/module";
import {EthereumActivity} from "../blockchain_modules";
import {ethRandomApprove_approve, ethRandomMint_mint, ethWrapUnwrap_unwrap, ethWrapUnwrap_wrap} from "./interations";

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