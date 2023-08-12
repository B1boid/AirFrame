import {Asset} from "../../config/tokens";
import {Blockchains} from "../../config/chains";

export interface OKXWithdrawalConfig {
    fee: string,
    confirmations: number,
    withdrawalConfirmationsUnlock: number
}

export function okxWithdrawalConfig(asset: Asset, blockchain: Blockchains): OKXWithdrawalConfig {
    const key = `${asset}${blockchain}`
    switch (key) {
        case Asset.MATIC + Blockchains.Polygon:
            return {
                fee: "0.1",
                confirmations: 1,
                withdrawalConfirmationsUnlock: 900
            }
        case Asset.ETH + Blockchains.ZkSync:
            return {
                fee: "0.0003",
                confirmations: -1,
                withdrawalConfirmationsUnlock: -1
            }
        case Asset.ETH + Blockchains.Ethereum:
            return {
                fee: "0.00056",
                confirmations: 1,
                withdrawalConfirmationsUnlock: -1
            }
        default:
            return {
                fee: "0",
                confirmations: -1,
                withdrawalConfirmationsUnlock: -1
            }
    }
}

export function destToOkxChain(blockchain: Blockchains) {
    switch (blockchain) {
        case Blockchains.Polygon:
            return "Polygon"
        case Blockchains.ZkSync:
            return "zkSync Era"
        case Blockchains.Ethereum:
            return "ERC20"
        default:
            return ""
    }
}