import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";



export function polygonProject1_wrap(wallet: WalletI): TxInteraction[] {
    let txs = []
    txs.push({
        to: "0x000000",
        data: "0x000000",
        value: "0"
    })
    return txs
}