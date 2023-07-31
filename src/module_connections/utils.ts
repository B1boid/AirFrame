import {TxInteraction} from "../classes/module";
import {Asset} from "../classes/actions";

// TODO add Currency type
export function getTxForTransfer(ccy: Asset, to: string, amount: number): TxInteraction {
    switch (ccy) {
        case Asset.ETH:
            return {to: to, data: "", value: amount.toString()}
        case Asset.USDT:
            return {to: "ContractUSDT", data: "tx data", value: "0"}
        default:
            throw new Error("Not implemented asset.")
    }
}