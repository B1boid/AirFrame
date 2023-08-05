import {TxInteraction} from "../classes/module";
import {Asset} from "../config/tokens";

// TODO add Currency type
export function getTxForTransfer(ccy: Asset, to: string, amount: number): TxInteraction {
    switch (ccy) {
        case Asset.ETH:
            return {to: to, data: "", value: amount.toString(), stoppable: true, confirmations: 1, name: "eth-transfer"}
        case Asset.USDT:
            return {to: "ContractUSDT", data: "tx data", value: "0", stoppable: true, confirmations: 1, name: "usdt-transfer"}
        case Asset.MATIC:
            return {to: to, data: "", value: amount.toString(), stoppable: true, confirmations: 1, name: "matic-transfer"}
        default:
            throw new Error("Not implemented asset.")
    }
}