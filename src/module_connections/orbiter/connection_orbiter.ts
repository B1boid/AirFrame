import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Chain, Destination} from "../../config/chains";
import {Asset} from "../../config/tokens";
import {globalLogger} from "../../utils/logger";
import {bigMax, getTxDataForAllBalanceTransfer, sleep} from "../../utils/utils";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {getTxForTransfer, waitBalanceChanged} from "../utils";
import {destToChain} from "../../module_blockchains/blockchain_modules";

const EXTRA_GAS_LIMIT = 10_000
const DEFAULT_GAS_PRICE = ethers.parseUnits("20", "gwei")
const ETH_BRIDGE_ROUTER = "0x80C67432656d59144cEFf962E8fAF8926599bCF8"

class OrbiterConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<[boolean, number]> {
        const logger = globalLogger.connect(wallet.getAddress())
        const chainFrom: Chain = destToChain(from)
        const chainTo: Chain = destToChain(to)

        if (chainTo.orbiterCode === undefined) {
            logger.error(`Destination chain ${chainTo.title} does not have orbiter.code field. Cannot transfer via Orbiter.`)
            return Promise.resolve([false, 0])
        }

        if (asset !== Asset.ETH) {
            logger.error(`It is possible to tranfer ETH only via Orbiter.`)
            return Promise.resolve([false, 0])
        }

        let transferTx: TxInteraction;
        let bigAmount: bigint
        if (amount === -1) {
            [bigAmount, transferTx] = await getTxDataForAllBalanceTransfer(wallet, ETH_BRIDGE_ROUTER, asset, chainFrom, EXTRA_GAS_LIMIT, DEFAULT_GAS_PRICE)
            amount = Number(ethers.formatEther(bigAmount))
            transferTx.value = transferTx.value.substring(0, transferTx.value.length - 4) + chainTo.orbiterCode.toString()
        } else {
            bigAmount = ethers.parseEther(`${amount}`)
            transferTx = getTxForTransfer(asset, ETH_BRIDGE_ROUTER, bigAmount)
            transferTx.value = transferTx.value.substring(0, transferTx.value.length - 4) + chainTo.orbiterCode.toString()
        }

        const toProvider = new ethers.JsonRpcProvider(chainTo.nodeUrl)
        let balanceBefore: bigint;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                balanceBefore = await toProvider.getBalance(wallet.getAddress())
                break
            } catch (e) {
                globalLogger.connect(wallet.getAddress()).warn(`Failed to fetch initial balance for Orbiter. Exception: ${e}`)
                await sleep(10)
            }
        }
        const [success,] = await wallet.sendTransaction(transferTx, chainFrom, 1)

        if (success === TxResult.Fail) {
            logger.error(`Failed to send transfer tx ${chainFrom.title} -> ${chainTo.title} using Orbiter.`)
            return Promise.resolve([false, 0])
        }

        const [result, newBalance] = await waitBalanceChanged(wallet, toProvider, balanceBefore)
        if (result) {
            globalLogger.connect(wallet.getAddress()).done(`Finished bridge to ${to} using Orbiter. Balance updated.`)
        } else {
            globalLogger.connect(wallet.getAddress()).error(`Could not fetch changed balance for Orbiter ${from} -> ${to}. Check logs.`)
        }
        return Promise.resolve([result, Number(
            ethers.formatEther(
                bigMax(BigInt(0), BigInt(newBalance) - balanceBefore)
            )
        )])
    }

}

export const orbiterConnectionModule: OrbiterConnectionModule = new OrbiterConnectionModule()
