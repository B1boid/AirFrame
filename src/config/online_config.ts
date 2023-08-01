// TODO: These parameters should be changeable online(without rerunning the app) through bot/dashboard

import {Blockchains} from "./chains";
import {toBigInt} from "ethers";
import {getRandomInt} from "../utils/utils";

export function GAS_PRICE_LIMITS(chain: Blockchains, randomized_percent: number = 10): bigint {
    let value: number = 1000 * (10 ** 9); // 1000 gwei is max for all blockchains
    switch (chain) {
        case Blockchains.Polygon:
            value = 900 * (10 ** 9) // 900 gwei
            break
    }
    if (randomized_percent != 0) {
        value += Math.floor(getRandomInt(-randomized_percent / 100 * value, randomized_percent / 100 * value))
    }
    return toBigInt(value)
}

export function MAX_TX_WAITING(): number {
    return 10 * 60 * 1000 // timeout after 10 minutes
}