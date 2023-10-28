import {UnionProvider} from "../classes/wallet";
import {TxInteraction} from "../classes/module";
import {Blockchains, Chain, ethereumChain} from "../config/chains";
import * as oldethers from "ethers";
import * as zk from "zksync-web3";
import {ethers, FeeData, toBigInt} from "ethers-new";
import {getRandomInt, sleep} from "./utils";
import {GAS_PRICE_LIMITS} from "../config/online_config";
import {globalLogger} from "./logger";
import {asL2Provider} from "@eth-optimism/sdk"

const HIGH_GAS_PRICE_LOG_STEP = 100
export async function getGasLimit(provider: UnionProvider, chain: Chain, from: string, txInteraction: TxInteraction): Promise<number> {
    return Number((await provider.estimateGas({
        from: from,
        to: txInteraction.to,
        data: txInteraction.data,
        value: txInteraction.value
    })).toString())
}

export async function getFeeData(provider: UnionProvider, chain: Chain): Promise<FeeData> {
    let curGasPriceInfo: FeeData
    let counter: number = 0
    while (true) {
        try {
            if (chain.title === Blockchains.ZkSync) {
                const tmpGasInfo: oldethers.providers.FeeData = await (provider as zk.Provider).getFeeData()
                curGasPriceInfo = new FeeData(
                    tmpGasInfo.gasPrice ? BigInt(tmpGasInfo.gasPrice.toString()) : null,
                    tmpGasInfo.gasPrice ? BigInt(tmpGasInfo.gasPrice.toString()) : null,
                    tmpGasInfo.gasPrice ? BigInt(tmpGasInfo.gasPrice.toString()) : null,
                )
            } else {
                curGasPriceInfo = await (provider as ethers.JsonRpcProvider).getFeeData()
            }
            if (chain.title === Blockchains.Arbitrum) {
                curGasPriceInfo = new FeeData(
                    curGasPriceInfo.gasPrice,
                    curGasPriceInfo.gasPrice,
                    BigInt(0)
                )
            }
            if (chain.title === Blockchains.Optimism) {
                curGasPriceInfo = new FeeData(
                    curGasPriceInfo.maxFeePerGas,
                    curGasPriceInfo.maxFeePerGas,
                    curGasPriceInfo.maxPriorityFeePerGas
                )
            }
            if (chain.title === Blockchains.Polygon) {
                curGasPriceInfo = new FeeData(
                    curGasPriceInfo.maxFeePerGas,
                    curGasPriceInfo.maxFeePerGas,
                    toBigInt(getRandomInt(32, 70) * (10 ** 9)) // polygon min value is 30 (we multiply by 2 later, so 32 > 30)
                )
            }
            if (chain.title === Blockchains.Ethereum) {
                let increaseGasPrice = (curGasPriceInfo.gasPrice !== null) && (curGasPriceInfo.maxPriorityFeePerGas !== null)
                let gasPrice: bigint | null = increaseGasPrice ? curGasPriceInfo.gasPrice! + BigInt(2) * curGasPriceInfo.maxPriorityFeePerGas! : curGasPriceInfo.gasPrice
                curGasPriceInfo = new FeeData(
                    gasPrice,
                    gasPrice,
                    curGasPriceInfo.maxPriorityFeePerGas
                )
            }
            if (chain.title == Blockchains.Scroll) {
                let mainnetProvider = new ethers.JsonRpcProvider(ethereumChain.nodeUrl, ethereumChain.chainId)
                let mainnetFee = await mainnetProvider.getFeeData()
                if (curGasPriceInfo.gasPrice !== null && mainnetFee.gasPrice !== null &&
                    mainnetFee.gasPrice < GAS_PRICE_LIMITS(chain.title)) {
                    return curGasPriceInfo
                }
                if (counter % HIGH_GAS_PRICE_LOG_STEP === 10) {
                    globalLogger.warn(`Gas price is too high | Gas price: ${curGasPriceInfo.gasPrice} | Mainnet: ${mainnetFee.gasPrice}`)
                }
            } else {
                if (curGasPriceInfo.gasPrice !== null && curGasPriceInfo.gasPrice < GAS_PRICE_LIMITS(chain.title)) {
                    return curGasPriceInfo
                }
                if (counter % HIGH_GAS_PRICE_LOG_STEP === 10) {
                    globalLogger.warn(`Gas price is too high | Gas price: ${curGasPriceInfo.gasPrice}`)
                }
            }
            counter++
            await sleep(10)
        } catch (e) {
            globalLogger.warn(`Error getting gas price | ${e}`)
            await sleep(10)
        }
    }
}

export async function getL1Cost(provider: UnionProvider, chain: Chain, from: string, txInteraction: TxInteraction): Promise<bigint> {
    try {
        const optProvider = asL2Provider(new oldethers.providers.JsonRpcProvider(chain.nodeUrl, chain.chainId))
        const l1GasCost: bigint = (await optProvider.estimateL1GasCost({
            from: from,
            to: txInteraction.to,
            data: txInteraction.data,
            value: txInteraction.value
        })).toBigInt()
        return (l1GasCost * BigInt(40)) / BigInt(100) + l1GasCost // + 40%
    } catch (e) {
        globalLogger.error(`Error getting L1 cost | ${e}`)
        return BigInt(0)
    }

}