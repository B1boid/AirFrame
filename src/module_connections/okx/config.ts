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
                confirmations: 300,
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
                fee: "0.0012",
                confirmations: 64,
                withdrawalConfirmationsUnlock: 96
            }
        case Asset.ETH + Blockchains.Optimism:
            return {
                fee: "0.0001",
                confirmations: 150,
                withdrawalConfirmationsUnlock: 200
            }
        case Asset.ETH + Blockchains.Arbitrum:
            return {
                fee: "0.0001",
                confirmations: 12,
                withdrawalConfirmationsUnlock: 12
            }
        case Asset.BNB + Blockchains.Bsc:
            return {
                fee: "0.002",
                confirmations: 12,
                withdrawalConfirmationsUnlock: 30
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
        case Blockchains.Optimism:
            return "Optimism"
        case Blockchains.Ethereum:
            return "ERC20"
        case Blockchains.Arbitrum:
            return "Arbitrum One"
        case Blockchains.Bsc:
            return "BSC"
        default:
            return ""
    }
}