import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";


export function zksyncProject1_swap(wallet: WalletI): TxInteraction[] {
    let txs = []
    let allowance = Math.random()
    // For example we can check allowance and add approve tx
    if (allowance > 0.5) {
        txs.push({
            to: "0x000000",
            data: "0x000000",
            value: "0"
        })
    }
    txs.push({
        to: "0x000000",
        data: "0x000000",
        value: "10000"
    })
    return txs
}

export function zksyncProject2_stake(wallet: WalletI): TxInteraction[] {
    let txs = []
    txs.push({
        to: "0x000000",
        data: "0x000000",
        value: "10000"
    })
    return txs
}

export function zksyncProject2_unstake(wallet: WalletI): TxInteraction[] {
    let txs = []
    txs.push({
        to: "0x000000",
        data: "0x000000",
        value: "0"
    })
    return txs
}