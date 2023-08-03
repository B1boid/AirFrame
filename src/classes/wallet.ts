import {TxInteraction} from "./module";
import {getRandomInt, sleep} from "../utils/utils";
import {
    AbstractProvider,
    ethers,
    FeeData,
    toBigInt,
    toNumber,
    TransactionReceipt,
    TransactionResponse
} from "ethers";
import {Blockchains, Chain} from "../config/chains";
import {ConsoleLogger, ILogger} from "../utils/logger"
import {AddressInfo, OkxCredentials} from "./info";
import {GAS_PRICE_LIMITS, MAX_TX_WAITING} from "../config/online_config";


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

    getSubAccountName(): string | null

    sendTransaction(tx: TxInteraction, chain: Chain, maxRetries: number): Promise<TxResult>
}

export class Wallet implements WalletI {
    private signer: ethers.Wallet
    private readonly masterCredentials: OkxCredentials | null
    private readonly withdrawAddress: string | null
    private readonly subAccountName: string | null
    private readonly logger: ILogger
    private curGasLimit: number = 0
    private lastTxGasPrice: bigint = BigInt(0)
    private curGasPriceInfo: FeeData = new FeeData(BigInt(0), BigInt(0), BigInt(0));

    constructor(addressInfo: AddressInfo, masterCredentials: OkxCredentials | null, logger: ILogger | null = null) {
        this.signer = new ethers.Wallet(addressInfo.privateKey)
        if (this.signer.address.toLowerCase() !== addressInfo.address.toLowerCase()) throw new Error("Address mismatch")
        this.logger = logger ? logger : new ConsoleLogger(this.signer.address)
        this.withdrawAddress = addressInfo.withdrawAddress
        this.masterCredentials = masterCredentials
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

    private async resetGasInfo(provider: AbstractProvider, txInteraction: TxInteraction, chain: Chain): Promise<TxResult> {
        try {
            this.curGasLimit = toNumber(await provider.estimateGas({
                from: this.getAddress(),
                to: txInteraction.to,
                data: txInteraction.data,
                value: txInteraction.value
            }))
            this.curGasPriceInfo = await provider.getFeeData()
            if (chain.title === Blockchains.Polygon) {
                this.curGasPriceInfo = new FeeData(
                    this.curGasPriceInfo.gasPrice,
                    this.curGasPriceInfo.maxFeePerGas,
                    toBigInt(getRandomInt(16, 30) * (10 ** 9)) // polygon min value is 30 (we multiply by 2 later, so 32 > 30)
                )
            }
            while (this.curGasPriceInfo.gasPrice !== null && this.curGasPriceInfo.gasPrice > GAS_PRICE_LIMITS(chain.title)) {
                await sleep(60)
                this.logger.warn(`Gas price is too high | Gas price: ${this.curGasPriceInfo.gasPrice}`)
            }
            return TxResult.Success
        } catch (e) {
            this.logger.warn(`Error while simulating tx ${txInteraction.name}, ${e}`)
            return TxResult.Fail
        }
    }

    async sendTransaction(txInteraction: TxInteraction, chain: Chain, maxRetries: number = 1): Promise<TxResult> {
        const provider: AbstractProvider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        const curSigner: ethers.Wallet = this.signer.connect(provider)

        for (let retry = 0; retry < maxRetries + 1; retry++) {
            let result: TxResult = await this.resetGasInfo(provider, txInteraction, chain)
            if(result === TxResult.Success) {
                this.curGasLimit += TX_LOGIC_BY_TRY[retry].addGasLimit + chain.extraGasLimit
                result = await this._sendTransaction(curSigner, txInteraction)
            }
            switch (result) {
                case TxResult.Success:
                    this.logger.success(`Tx:${txInteraction.name} Gas used: ${this.curGasLimit}. Gas price: ${this.lastTxGasPrice / BigInt(10 ** 9)}`)
                    return TxResult.Success
                case TxResult.Fail:
                    this.logger.warn(`Tx:${txInteraction.name} Tx failed. Try №${retry} | Gas used: ${this.curGasLimit}`)
                    if (retry !== maxRetries) {
                        await sleep(TX_LOGIC_BY_TRY[retry + 1].wait)
                    }
            }

        }
        this.logger.error(`Tx:${txInteraction.name} failed after ${maxRetries} tries`)
        return TxResult.Fail
    }


    private async _sendTransaction(curSigner: ethers.Wallet, txInteraction: TxInteraction): Promise<TxResult> {
        try {
            let gasPrice;
            if (this.curGasPriceInfo.maxFeePerGas === null || this.curGasPriceInfo.maxPriorityFeePerGas === null) {
                gasPrice = {
                    gasPrice: this.curGasPriceInfo.gasPrice
                }
            } else {
                gasPrice = {
                    type: 2,
                    maxFeePerGas: this.curGasPriceInfo.maxFeePerGas,
                    maxPriorityFeePerGas: this.curGasPriceInfo.maxPriorityFeePerGas * BigInt(2)
                }
            }
            const tx: TransactionResponse = await curSigner.sendTransaction({
                to: txInteraction.to,
                data: txInteraction.data,
                value: txInteraction.value,
                gasLimit: this.curGasLimit.toString(),
                nonce: await curSigner.getNonce(),
                ...gasPrice
            })

            this.logger.info(`Tx:${txInteraction.name} sending transaction with tx_hash: ${tx.hash}`)

            const receipt: TransactionReceipt | null = await tx.wait(1, MAX_TX_WAITING())

            if (!receipt) {
                this.logger.warn("Receipt is null.")
                return TxResult.Fail
            }

            this.logger.info(`Tx:${txInteraction.name} mined successfully: ${tx.hash}`)

            this.curGasLimit = toNumber(receipt.gasUsed)
            this.lastTxGasPrice = receipt.gasPrice

            if (receipt.status == 1) {
                return TxResult.Success
            } else {
                return TxResult.Fail
            }
        } catch (e) {
            this.logger.warn(`Tx:${txInteraction.name} failed. Error: ${e}`)
            return TxResult.Fail
        }

    }
}