import {UnionProvider} from "../classes/wallet";
import {TxInteraction} from "../classes/module";
import {Blockchains, Chain} from "../config/chains";
import * as oldethers from "ethers";
import * as zk from "zksync-web3";
import {ethers, FeeData, toBigInt} from "ethers-new";
import {getRandomInt, sleep} from "./utils";
import {GAS_PRICE_LIMITS} from "../config/online_config";
import {globalLogger} from "./logger";

export async function getGasLimit(provider: UnionProvider, from: string,  txInteraction: TxInteraction) {
    return Number((await provider.estimateGas({
        from: from,
        to: txInteraction.to,
        data: txInteraction.data,
        value: txInteraction.value
    })).toString())
}

export async function getFeeData(provider: UnionProvider, chain: Chain) {
    let curGasPriceInfo: FeeData
    while (true) {
        if (chain.title === Blockchains.ZkSync) {
            const tmpGasInfo: oldethers.providers.FeeData = await (provider as zk.Provider).getFeeData()
            curGasPriceInfo = new FeeData(
                tmpGasInfo.gasPrice?.toBigInt() ?? null,
                tmpGasInfo.maxFeePerGas?.toBigInt() ?? null,
                tmpGasInfo.maxPriorityFeePerGas?.toBigInt() ?? null
            )
        } else {
            curGasPriceInfo = await (provider as ethers.JsonRpcProvider).getFeeData()
        }
        if (chain.title === Blockchains.Polygon) {
            curGasPriceInfo = new FeeData(
                curGasPriceInfo.maxFeePerGas,
                curGasPriceInfo.maxFeePerGas,
                toBigInt(getRandomInt(32, 70) * (10 ** 9)) // polygon min value is 30 (we multiply by 2 later, so 32 > 30)
            )
        }
        if (chain.title === Blockchains.Ethereum) {
            curGasPriceInfo = new FeeData(
                curGasPriceInfo.gasPrice,
                curGasPriceInfo.gasPrice,
                curGasPriceInfo.maxPriorityFeePerGas
            )
        }

        if (curGasPriceInfo.gasPrice !== null && curGasPriceInfo.gasPrice < GAS_PRICE_LIMITS(chain.title)) {
            return curGasPriceInfo
        }
        globalLogger.warn(`Gas price is too high | Gas price: ${curGasPriceInfo.gasPrice}`)
        await sleep(60)
    }
}