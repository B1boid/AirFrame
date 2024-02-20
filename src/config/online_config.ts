import {Blockchains} from "./chains";
import {toBigInt} from "ethers-new";
import {EnumDictionary, getRandomInt} from "../utils/utils";
import {globalLogger} from "../utils/logger";


export const allGases : EnumDictionary<Blockchains, number> = {
    [Blockchains.Ethereum]: 24,
    [Blockchains.Polygon]: 900,
    [Blockchains.ZkSync]: 27, // mainnet fee
    [Blockchains.Arbitrum]: 1000,
    [Blockchains.Optimism]: 1000,
    [Blockchains.Bsc]: 1000,
    [Blockchains.Scroll]: 27, // mainnet fee
    [Blockchains.Linea]: 30 // mainnet fee
}

export function setGasPriceLimit(chain: Blockchains, limit: number) {
    globalLogger.info(`Changed global gas price limit for ${chain}. New value: ${allGases[chain]}`)
    allGases[chain] = limit
}

export function GAS_PRICE_LIMITS(chain: Blockchains): bigint {
    return toBigInt(getRandomInt(allGases[chain] - 1, allGases[chain] + 1) * (10 ** 9))
}

export function MAX_TX_WAITING(confirmations: number): number {
    if (confirmations === 1) {
        return 10 * 60 * 1000 // timeout after 10 minutes
    }
    return 30 * 60 * 1000 // timeout after 30 minutes
}