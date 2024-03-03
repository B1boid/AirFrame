import axios from 'axios';
import {ConnectionModule} from "../../classes/connection";
import { TxResult, UnionProvider, WalletI } from '../../classes/wallet';
import { Blockchains, Chain, Destination } from '../../config/chains';
import { Asset } from '../../config/tokens';
import {ethers} from "ethers-new";
import { bigMax, getChainBalance } from '../../utils/utils';
import { destToChain } from '../../module_blockchains/blockchain_modules';
import { globalLogger } from '../../utils/logger';
import { TxInteraction } from '../../classes/module';
import { waitBalanceChanged } from '../utils';
import { getFeeData } from '../../utils/gas';
import * as zk from "zksync-web3";
import { DEFAULT_GAS_PRICE } from '../orbiter/connection_orbiter';

const QUOTE_ENDPOINT = "https://api-beta.pathfinder.routerprotocol.com/api/v2/quote"
const TX_ENDPOINT = "https://api-beta.pathfinder.routerprotocol.com/api/v2/transaction"

class NitroConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number, keepAmount: number): Promise<[boolean, number]> {
        if (asset != Asset.ETH) {
            return Promise.resolve([false, 0])
        }

        const chainFrom = destToChain(from)
        const chainTo = destToChain(to)
        
        let bigAmount: bigint;
        if (amount === -1) {
            bigAmount = await getChainBalance(wallet.getAddress(), chainFrom)
            if (keepAmount !== 0){
                let _keepAmount = ethers.parseEther(keepAmount.toString())
                bigAmount = bigAmount - (_keepAmount > bigAmount ? bigAmount * BigInt(20) / BigInt(100) : _keepAmount)
                globalLogger
                    .connect(wallet.getAddress(), chainFrom)
                    .info(`Keep amount: ${keepAmount.toString()}. To transfer: ${bigAmount.toString()}`)
            }
        } else {
            bigAmount = ethers.parseEther(`${amount}`)
            if (keepAmount !== 0) {
                let _keepAmount = ethers.parseEther(keepAmount.toString())
                bigAmount = bigAmount - (_keepAmount > bigAmount ? bigAmount * BigInt(20) / BigInt(100) : _keepAmount)
                globalLogger
                    .connect(wallet.getAddress(), chainFrom)
                    .info(`Keep amount: ${keepAmount.toString()}. To transfer: ${bigAmount.toString()}`)
            }
        }
        const balanceToBefore = await getChainBalance(wallet.getAddress(), chainTo)

        // estimate gasLimit/gasPrice
        const quoteEstimate = await this.getQuote(bigAmount, chainFrom, chainTo)
        quoteEstimate["senderAddress"] = wallet.getAddress()
        quoteEstimate["receiverAddress"] = wallet.getAddress()
        const txDataRawEstimate = await this.buildTx(quoteEstimate)

        let provider: UnionProvider
        if (chainFrom.title === Blockchains.ZkSync) {
            provider = new zk.Provider(chainFrom.nodeUrl)
        } else {
            provider = new ethers.JsonRpcProvider(chainFrom.nodeUrl, chainFrom.chainId)
        }

        const feeData = await getFeeData(provider, chainFrom)
        if (amount == -1) {
            bigAmount = bigAmount - BigInt(txDataRawEstimate.txn.gasLimit) * (feeData.maxFeePerGas ?? DEFAULT_GAS_PRICE) // в эстимейте есть газлимит, но он какой-то лажовый
        }
        const quote = await this.getQuote(bigAmount, chainFrom, chainTo)
        quote["senderAddress"] = wallet.getAddress()
        quote["receiverAddress"] = wallet.getAddress()
        const txDataRaw = await this.buildTx(quote)

        const transferTx: TxInteraction = {
            to: txDataRaw["txn"]["to"],
            data: txDataRaw["txn"]["data"],
            value: txDataRaw["txn"]["value"],
            stoppable: true,
            confirmations: 1,
            name: "nitro-eth-transfer"
        }

        const [success,] = await wallet.sendTransaction(transferTx, chainFrom, 1)

        if (success === TxResult.Fail) {
            globalLogger.connect(wallet.getAddress(), chainFrom).error(`Failed to send transfer tx ${chainFrom.title} -> ${chainTo.title} using Nitro.`)
            return Promise.resolve([false, 0])
        }

        const toProvider = new ethers.JsonRpcProvider(chainTo.nodeUrl)
        const [result, newBalance] = await waitBalanceChanged(wallet, chainTo, toProvider, balanceToBefore)

        if (result) {
            globalLogger.connect(wallet.getAddress(), chainTo).done(`Finished bridge to ${to} using Nitro. Balance updated.`)
        } else {
            globalLogger.connect(wallet.getAddress(), chainTo).error(`Could not fetch changed balance for Nitro ${from} -> ${to}. Check logs.`)
        }

        return Promise.resolve([result, Number(
            ethers.formatEther(
                bigMax(BigInt(0), BigInt(newBalance) - balanceToBefore)
            )
        )])
    }

    async getQuote(amount: bigint, fromChain: Chain, toChain: Chain): Promise<any> {
        const params = {
            "fromTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            "toTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            "amount": amount,
            "fromTokenChainId": fromChain.nitroConnectionId,
            "toTokenChainId": toChain.nitroConnectionId,
            "partnerId": 0
        }

        const tx_data = await axios.get(QUOTE_ENDPOINT, { params: params })
        return tx_data.data
    }

    async buildTx(params: any): Promise<any> {
        return (await axios.post(TX_ENDPOINT, params)).data
    }
}

export const nitroConnectionModule: NitroConnectionModule = new NitroConnectionModule()
