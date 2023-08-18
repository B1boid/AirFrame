import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Destination, ethereumChain, zkSyncChain} from "../../config/chains";
import {globalLogger} from "../../utils/logger";
import {Asset} from "../../config/tokens";
import {TxInteraction} from "../../classes/module";
import {Contract, ethers, FeeData} from "ethers-new";
import zk_sync_bridge_official from "../../abi/zksync_bridge_official.json"
import * as zk from "zksync-web3"
import {getFeeData, getGasLimit} from "../../utils/gas";
import {sleep} from "../../utils/utils";
import {destToChain} from "../../module_blockchains/blockchain_modules";

const tag = "Official ZkSync bridge"
const BRIDGE_ADDRESS = "0x32400084C286CF3E17e7B677ea9583e60a000324"
export const DEFAULT_GAS_PRICE_ZKSYNC_OFFICIAL_BRIDGE = ethers.parseUnits("20", "gwei")
export const ZKSYNC_BRIDGE_NAME = `${tag}: Bridge ETH from Ethereum to ZkSync.`
const SEND_ALL = -1;

const MAX_RETIRES_BALANCE_CHANGED = 90;

const L1_DEFAULT_GAS = BigInt(120_000)
const L2_BRIDGE_GAS_LIMIT = 733664;

class ZkSyncEthOfficialConectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<boolean> {
        if (!(to === Destination.ZkSync && from === Destination.Ethereum)) {
            globalLogger.connect(wallet.getAddress())
                .error(`Wrong networks for ${tag}. Expected ETH -> ZKSYNC. Found: ${from} -> ${to}.`)
            return Promise.resolve(false)
        }

        if (asset !== Asset.ETH) {
            globalLogger.connect(wallet.getAddress()).error(`Only ETH supported for ${tag}.`)
            return Promise.resolve(false)
        }

        const balanceBefore = await new zk.Provider(zkSyncChain.nodeUrl).getBalance(wallet.getAddress())
        const tx = await this.buildTx(wallet, from, amount)

        if (tx == null) {
            globalLogger.connect(wallet.getAddress()).error(`Failed to build bridge transaction for ${tag}.`)
            return Promise.resolve(false)
        }
        const [homeResponse, l1Hash] = await wallet.sendTransaction(tx, destToChain(from), 1)

        if (homeResponse === TxResult.Fail) {
            globalLogger.connect(wallet.getAddress()).error(`Failed tx for bridging ${from} -> ${to} using ${tag}.`)
            return Promise.resolve(false)
        }
        globalLogger.connect(wallet.getAddress()).info(`Submitted tx ${from} -> ${to} in ${tag}. L1 Hash: ${l1Hash}.`)

        return await this.waitBalanceChanged(wallet, to, balanceBefore.toBigInt())
    }

    private async buildTx(wallet: WalletI, from: Destination, amount: number): Promise<TxInteraction | null> {
        try {
            if (from === Destination.Ethereum) {
                const provider = new ethers.JsonRpcProvider(ethereumChain.nodeUrl, ethereumChain.chainId)
                const bridge = new Contract(BRIDGE_ADDRESS, zk_sync_bridge_official, provider)

                const getData = (dataAmount: string) => {
                    return bridge.interface.encodeFunctionData("requestL2Transaction",
                        [wallet.getAddress(), dataAmount, "0x", L2_BRIDGE_GAS_LIMIT,
                            zk.utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT, [], wallet.getAddress()])
                }
                const feeData: FeeData = await getFeeData(provider, ethereumChain)
                const gasPrice = feeData.gasPrice ?? DEFAULT_GAS_PRICE_ZKSYNC_OFFICIAL_BRIDGE
                const baseCost: bigint = await bridge.l2TransactionBaseCost(
                    gasPrice,
                    L2_BRIDGE_GAS_LIMIT,
                    zk.utils.REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT
                )

                let amountToSendWithFees = (BigInt(amount) + baseCost).toString()
                let amountToSend = amount.toString()

                if (amount === SEND_ALL) {
                    const balance = await provider.getBalance(wallet.getAddress())
                    const estimateData = {
                        name: ZKSYNC_BRIDGE_NAME,
                        to: BRIDGE_ADDRESS,
                        data: getData((balance - baseCost - gasPrice * L1_DEFAULT_GAS).toString()),
                        confirmations: 1,
                        value: (balance - gasPrice * L1_DEFAULT_GAS).toString(),
                        stoppable: false
                    }
                    const estimatedGas = await getGasLimit(provider, ethereumChain, wallet.getAddress(), estimateData)
                    const l1FeesToPay = BigInt(estimatedGas) * (feeData.maxFeePerGas ?? DEFAULT_GAS_PRICE_ZKSYNC_OFFICIAL_BRIDGE)

                    amountToSendWithFees = (balance - l1FeesToPay).toString()
                    amountToSend = (balance - baseCost - l1FeesToPay).toString()
                }

                const data = getData(amountToSend)

                return {
                    name: ZKSYNC_BRIDGE_NAME,
                    to: BRIDGE_ADDRESS,
                    data: data,
                    confirmations: 1,
                    value: amountToSendWithFees,
                    stoppable: false,
                    feeData: feeData
                }
            }
        } catch (e) {
            globalLogger.connect(wallet.getAddress()).error(`${tag} failed. Exception: ${e}`)
            return null
        }

        throw Error("Not implemented.")

    }

    private async waitBalanceChanged(wallet: WalletI, to: Destination, balanceBefore: bigint) {
        if (to === Destination.ZkSync) {
            const zkSynProvider: zk.Provider = new zk.Provider(zkSyncChain.nodeUrl)
            let retry = 0;
            while (retry < MAX_RETIRES_BALANCE_CHANGED) {
                const newBalance = (await zkSynProvider.getBalance(wallet.getAddress())).toBigInt()
                globalLogger.connect(wallet.getAddress()).info(`Try ${retry + 1}/${MAX_RETIRES_BALANCE_CHANGED}. Waiting for balance changing. Old balance:${ethers.formatEther(balanceBefore)}. New balance: ${ethers.formatEther(newBalance)}`)
                if (newBalance != balanceBefore) {
                    globalLogger.connect(wallet.getAddress()).success(`Balance changed! New balance: ${ethers.formatEther(newBalance)}`)
                    return Promise.resolve(true)
                }
                retry++
                await sleep(45)
            }
        }
        globalLogger.connect(wallet.getAddress()).error(`Balance has not changed after ${MAX_RETIRES_BALANCE_CHANGED} tries.`)
        return Promise.resolve(false);
    }
}

export const zkSyncEthConnectionModule: ZkSyncEthOfficialConectionModule = new ZkSyncEthOfficialConectionModule()