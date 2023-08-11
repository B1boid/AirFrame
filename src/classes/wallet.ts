import {TxInteraction} from "./module";
import {sleep} from "../utils/utils";
import {ethers, FeeData, JsonRpcProvider, toBigInt, TransactionReceipt, TransactionResponse, Wallet,} from "ethers-new";
import {Blockchains, Chain, ethereumChain, zkSyncChain} from "../config/chains";
import {ConsoleLogger, ILogger} from "../utils/logger"
import {AddressInfo, OkxCredentials} from "./info";
import {MAX_TX_WAITING} from "../config/online_config";
import * as zk from "zksync-web3";
import * as oldethers from "ethers";
import {getFeeData, getGasLimit} from "../utils/gas";
import {
    DEFAULT_GAS_PRICE_ZKSYNC_OFFICIAL_BRIDGE,
    ZKSYNC_BRIDGE_NAME
} from "../module_connections/eth-zksyncofficial/connection_eth_zksync_official";


export enum TxResult {
    Success,
    Fail,
}


const TX_LOGIC_BY_TRY = [
    {
        wait: 0,
        addGasLimit: 0
    },
    {
        wait: 60,
        addGasLimit: 200000
    }
    // ...
]

export interface WalletI {
    getAddress(): string

    getWithdrawAddress(): string | null

    getMasterCredentials(): OkxCredentials | null

    getSubAccountCredentials(): OkxCredentials | null

    getSubAccountName(): string | null

    getWallet(chain: Chain): Wallet | zk.Wallet

    sendTransaction(tx: TxInteraction, chain: Chain, maxRetries: number): Promise<[TxResult, string]>
}

export type UnionProvider = ethers.JsonRpcProvider | zk.Provider
type UnionWallet = ethers.Wallet | zk.Wallet

export class MyWallet implements WalletI {
    private signer: ethers.Wallet
    private readonly masterCredentials: OkxCredentials | null
    private readonly subAccountCredentials: OkxCredentials | null
    private readonly withdrawAddress: string | null
    private readonly subAccountName: string | null
    private readonly logger: ILogger
    private curGasLimit: number = 0
    private lastTxGasPrice: bigint = BigInt(0)
    private curGasPriceInfo: FeeData = new FeeData(BigInt(0), BigInt(0), BigInt(0));

    constructor(addressInfo: AddressInfo, masterCredentials: OkxCredentials | null,
                subAccountCredentials: OkxCredentials | null, logger: ILogger | null = null) {
        this.signer = new ethers.Wallet(addressInfo.privateKey)
        if (this.signer.address.toLowerCase() !== addressInfo.address.toLowerCase()) throw new Error("Address mismatch")
        this.logger = logger ? logger : new ConsoleLogger(this.signer.address)
        this.withdrawAddress = addressInfo.withdrawAddress
        this.masterCredentials = masterCredentials
        this.subAccountCredentials = subAccountCredentials
        this.subAccountName = addressInfo.subAccName
    }

    getSubAccountName(): string | null {
        return this.subAccountName
    }

    getAddress(): string {
        return this.signer.address
    }

    getWithdrawAddress(): string | null {
        return this.withdrawAddress
    }

    getMasterCredentials(): OkxCredentials | null {
        return this.masterCredentials;
    }

    private async resetGasInfo(provider: UnionProvider, txInteraction: TxInteraction, chain: Chain): Promise<TxResult> {
        try {
            this.curGasLimit = await getGasLimit(provider, this.getAddress(), txInteraction)
            this.curGasPriceInfo = await getFeeData(provider, chain)

            return TxResult.Success
        } catch (e) {
            this.logger.warn(`Error while simulating tx ${txInteraction.name}, ${e}`)
            return TxResult.Fail
        }
    }

    async sendTransaction(txInteraction: TxInteraction, chain: Chain, maxRetries: number = 1): Promise<[TxResult, string]> {
        let provider: ethers.JsonRpcProvider | zk.Provider
        let curSigner: ethers.Wallet | zk.Wallet
        if (chain.title === Blockchains.ZkSync) {
            provider = new zk.Provider(chain.nodeUrl)
            curSigner = new zk.Wallet(this.signer.privateKey, provider, oldethers.getDefaultProvider())
        } else {
            provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            curSigner = this.signer.connect(provider)
        }

        for (let retry = 0; retry < maxRetries + 1; retry++) {
            let result: TxResult = await this.resetGasInfo(provider, txInteraction, chain)
            let txHash: string = ""
            if(result === TxResult.Success) {
                this.curGasLimit += TX_LOGIC_BY_TRY[retry].addGasLimit + chain.extraGasLimit
                const [sendResponse, txInfo] = await this._sendTransaction(curSigner, txInteraction)
                result = sendResponse
                txHash = txInfo
            }
            switch (result) {
                case TxResult.Success:
                    this.logger.success(`Tx:${txInteraction.name} Gas used: ${this.curGasLimit}. Gas price: ${this.lastTxGasPrice / BigInt(10 ** 9)}`)
                    return [TxResult.Success, txHash]
                case TxResult.Fail:
                    this.logger.warn(`Tx:${txInteraction.name} Tx failed. Try №${retry} | Gas used: ${this.curGasLimit}`)
                    if (retry !== maxRetries) {
                        await sleep(TX_LOGIC_BY_TRY[retry + 1].wait)
                    }
            }

        }
        this.logger.error(`Tx:${txInteraction.name} failed after ${maxRetries} tries`)
        return [TxResult.Fail, ""]
    }


    private async _sendTransaction(curSigner: UnionWallet, txInteraction: TxInteraction): Promise<[TxResult, string]> {
        try {
            let txTyped;
            if (txInteraction.name === ZKSYNC_BRIDGE_NAME) {
                txTyped = {
                    gasPrice: this.curGasPriceInfo.gasPrice ?? DEFAULT_GAS_PRICE_ZKSYNC_OFFICIAL_BRIDGE
                }
            } else {
                if (this.curGasPriceInfo.maxFeePerGas === null || this.curGasPriceInfo.maxPriorityFeePerGas === null) {
                    if (this.curGasPriceInfo.gasPrice === null){
                        this.logger.warn(`Gas price is null ${this.curGasPriceInfo}`)
                        return [TxResult.Fail, ""]
                    }
                    txTyped = {
                        gasPrice: this.curGasPriceInfo.gasPrice,
                        gasLimit: oldethers.utils.hexlify(this.curGasLimit),
                        value: oldethers.utils.hexlify(BigInt(txInteraction.value)),
                    }
                } else {
                    txTyped = {
                        type: 2,
                        maxFeePerGas: this.curGasPriceInfo.maxFeePerGas,
                        maxPriorityFeePerGas: this.curGasPriceInfo.maxPriorityFeePerGas,
                        gasLimit: this.curGasLimit.toString(),
                        value: txInteraction.value,
                    }
                }
            }


            const tx: TransactionResponse | oldethers.providers.TransactionResponse = await curSigner.sendTransaction({
                to: txInteraction.to,
                data: txInteraction.data,
                nonce: await curSigner.getNonce(),
                ...txTyped
            })

            this.logger.info(`Tx:${txInteraction.name} sending transaction with tx_hash: ${tx.hash}`)

            const receipt: TransactionReceipt | oldethers.providers.TransactionReceipt | null = await tx.wait(
                txInteraction.confirmations, MAX_TX_WAITING(txInteraction.confirmations))
            if (!receipt) {
                this.logger.warn("Receipt is null.")
                return [TxResult.Fail, ""]
            }

            this.logger.info(`Tx:${txInteraction.name} mined successfully: ${tx.hash}`)

            this.curGasLimit = Number(receipt.gasUsed.toString())
            // @ts-ignore
            this.lastTxGasPrice = receipt.gasPrice ?? toBigInt(receipt.effectiveGasPrice.toString())

            if (receipt.status == 1) {
                return [TxResult.Success, tx.hash]
            } else {
                return [TxResult.Fail, ""]
            }
        } catch (e) {
            this.logger.warn(`Tx:${txInteraction.name} failed. Error: ${e}`)
            return [TxResult.Fail, ""]
        }
    }

    getSubAccountCredentials(): OkxCredentials | null {
        return this.subAccountCredentials
    }

    getWallet(chain: Chain): Wallet | zk.Wallet {
        if (chain.title === Blockchains.ZkSync) {
            const provider: zk.Provider = new zk.Provider(zkSyncChain.nodeUrl)
            const ethProvider = new oldethers.providers.JsonRpcProvider(ethereumChain.nodeUrl, ethereumChain.chainId)
            return new zk.Wallet(this.signer.privateKey, provider, ethProvider)
        }
        const provider: JsonRpcProvider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        return this.signer.connect(provider);
    }
}