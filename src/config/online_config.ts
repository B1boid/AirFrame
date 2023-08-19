import {Blockchains} from "./chains";
import {toBigInt} from "ethers-new";
import {getRandomInt} from "../utils/utils";
import {readFileSync} from "fs";

export function GAS_PRICE_LIMITS(chain: Blockchains): bigint {
    const file = readFileSync('online_config/gas_prices.txt', 'utf-8');
    const allGases = file.split('\n');
    let value: number = 1000 * (10 ** 9); // 1000 gwei is max for all blockchains
    for (const gasLine of allGases) {
        const info = gasLine.trim().split('=');
        const maxGasPrice = Number.parseInt(info[1].trim());
        if (info[0].trim() === chain) {
            value = getRandomInt(maxGasPrice - 1, maxGasPrice + 1) * (10 ** 9);
            break
        }
    }
    return toBigInt(value)
}

export function MAX_TX_WAITING(confirmations: number): number {
    if (confirmations === 1) {
        return 10 * 60 * 1000 // timeout after 10 minutes
    }
    return 30 * 60 * 1000 // timeout after 30 minutes
}