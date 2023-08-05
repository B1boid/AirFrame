import {Asset} from "../../config/tokens";
import {Blockchains} from "../../config/chains";

export interface OKXWithdrawalConfig {
    fee: string,
    confirmations: number,
    withdrawalConfirmationsUnlock: number
}

export const config: Record<string, OKXWithdrawalConfig> = {
    "MATIC-Polygon" : {
        fee: "0.1",
        confirmations: 300,
        withdrawalConfirmationsUnlock: 900
    }
}