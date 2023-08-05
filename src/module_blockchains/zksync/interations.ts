import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";


export async function zksyncProject1_swap(wallet: WalletI): Promise<TxInteraction[]> {
    let txs = []
    let allowance = Math.random()
    // For example we can check allowance and add approve tx
    if (allowance > 0.5) {
        txs.push({
            to: "0x000000",
            data: "0x000000",
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "zksyncProject1_swap"
        })
    }
    txs.push({
        to: "0x000000",
        data: "0x000000",
        value: "10000",
        stoppable: false,
        confirmations: 1,
        name: "zksyncProject1_swap"
    })
    return txs
}

export async function zksyncProject2_stake(wallet: WalletI): Promise<TxInteraction[]> {
    let txs = []
    txs.push({
        to: "0x000000",
        data: "0x000000",
        value: "10000",
        stoppable: false,
        confirmations: 1,
        name: "zksyncProject2_stake"
    })
    return txs
}

export async function zksyncProject2_unstake(wallet: WalletI): Promise<TxInteraction[]> {
    let txs = []
    txs.push({
        to: "0x000000",
        data: "0x000000",
        value: "0",
        stoppable: true,
        confirmations: 1,
        name: "zksyncProject2_unstake"
    })
    return txs
}