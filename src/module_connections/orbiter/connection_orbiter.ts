import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Chain, Destination, destToChain} from "../../config/chains";
import {Asset} from "../../config/tokens";
import {globalLogger} from "../../utils/logger";
import {getTxDataForAllBalanceTransfer, sleep} from "../../utils/utils";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {getTxForTransfer, waitBalanceChanged} from "../utils";

const EXTRA_GAS_LIMIT = 10_000
const DEFAULT_GAS_PRICE = ethers.parseUnits("20", "gwei")
const ETH_BRIDGE_ROUTER = "0x80C67432656d59144cEFf962E8fAF8926599bCF8"
class OrbiterConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<boolean> {
        const logger = globalLogger.connect(wallet.getAddress())
        const chainFrom: Chain = destToChain(from)
        const chainTo: Chain = destToChain(to)

        if (chainTo.orbiterCode === undefined) {
            logger.error(`Destination chain ${chainTo.title} does not have orbiter.code field. Cannot transfer via Orbiter.`)
            return Promise.resolve(false)
        }

        if (asset !== Asset.ETH) {
            logger.error(`It is possible to tranfer ETH only via Orbiter.`)
            return Promise.resolve(false)
        }

        let transferTx: TxInteraction;
        if (amount === -1) {
            [amount, transferTx] = await getTxDataForAllBalanceTransfer(wallet, ETH_BRIDGE_ROUTER, asset, chainFrom, EXTRA_GAS_LIMIT, DEFAULT_GAS_PRICE)
            transferTx.value = transferTx.value.substring(0, transferTx.value.length - 4) + chainTo.orbiterCode.toString()
        } else {
            amount = Number(ethers.parseEther(`${amount}`))
            transferTx = getTxForTransfer(asset, ETH_BRIDGE_ROUTER, amount)
            transferTx.value = transferTx.value.substring(0, transferTx.value.length - 4) + chainTo.orbiterCode.toString()
        }

        const toProvider = new ethers.JsonRpcProvider(chainTo.nodeUrl)
        let balanceBefore: bigint;
        while (true) {
            try {
                balanceBefore = await toProvider.getBalance(wallet.getAddress())
                break
            } catch (e) {
                globalLogger.connect(wallet.getAddress()).warn(`Failed to fetch initial balance for Orbiter. Exception: ${e}`)
                await sleep(10)
            }
        }
        const [success, hash] = await wallet.sendTransaction(transferTx, chainFrom, 1)

        if (success === TxResult.Fail) {
            logger.error(`Failed to send transfer tx ${chainFrom.title} -> ${chainTo.title} using Orbiter.`)
            return Promise.resolve(false)
        }

        const result = await waitBalanceChanged(wallet, toProvider, balanceBefore)
        if (result) {
            globalLogger.connect(wallet.getAddress()).done(`Finished bridge to ${to} using Orbiter. Balance updated.`)
        } else {
            globalLogger.connect(wallet.getAddress()).error(`Could not fetch changed balance for Orbiter ${from} -> ${to}. Check logs.`)
        }
        return result
    }

}

export const orbiterConnectionModule: OrbiterConnectionModule = new OrbiterConnectionModule()
