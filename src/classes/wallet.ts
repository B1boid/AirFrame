import {TxInteraction} from "./module";
import {sleep} from "../utils/utils";
import {AbstractProvider, ethers, TransactionReceipt} from "ethers";
import {Chain} from "../config/chains";
import {ConsoleLogger, ILogger} from "../utils/logger"
import {OkxCredentials} from "./okx";


export enum TxResult {
    Success,
    Fail,
}

const DEFAULT_ADD_GAS_LIMIT = BigInt(200000)
const DEFAULT_GAS_PRICE = BigInt(16)

const TX_LOGIC_BY_TRY = [
    {
        wait: 0,
        addGasLimit: BigInt(0)
    },
    {
        wait: 60,
        addGasLimit: DEFAULT_ADD_GAS_LIMIT
    }
    // ...
]

export interface WalletI {
    getAddress(): string

    getWithdrawAddress(): string | null

    getMasterCredentials(): OkxCredentials | null

    getSubAccountName(): string | null

    sendTransaction(tx: TxInteraction, maxRetries: number, chain: Chain): Promise<TxResult>
}

export class Wallet implements WalletI {
    private signer: ethers.Wallet
    private readonly masterCredentials: OkxCredentials | null
    private readonly withdrawAddress: string | null
    private readonly subAccountName: string | null
    private readonly logger: ILogger
    private curGasLimit = BigInt(0)
    private curGasPrice = DEFAULT_GAS_PRICE

    constructor(privateKey: string, masterCredentials: OkxCredentials | null, subAccountName: string | null,
                logger: ILogger | null = null, withdrawAddress: string | null = null) {
        this.signer = new ethers.Wallet(privateKey)
        this.logger = logger ? logger : new ConsoleLogger(this.signer.address)
        this.withdrawAddress = withdrawAddress
        this.masterCredentials = masterCredentials
        this.subAccountName = subAccountName
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

    async resetGasInfo(provider: AbstractProvider, txInteraction: TxInteraction): Promise<void> {
        this.curGasLimit = await provider.estimateGas({
            from: this.getAddress(),
            to: txInteraction.to,
            data: txInteraction.data,
            value: txInteraction.value
        })
        this.curGasPrice = DEFAULT_GAS_PRICE
    }

    async sendTransaction(txInteraction: TxInteraction, maxRetries: number = 1, chain: Chain): Promise<TxResult> {
        const provider: AbstractProvider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        const curSigner: ethers.Wallet = this.signer.connect(provider)

        await this.resetGasInfo(provider, txInteraction)

        for (let retry = 0; retry < maxRetries + 1; retry++) {
            this.curGasLimit += TX_LOGIC_BY_TRY[retry].addGasLimit
            const result: TxResult = await this._sendTransaction(curSigner, txInteraction)
            switch (result) {
                case TxResult.Success:
                    this.logger.success(`Gas used: ${this.curGasLimit}. Gas price: ${this.curGasPrice}`)
                    return TxResult.Success
                case TxResult.Fail:
                    this.logger.warn(`Tx failed. Try №${retry} | Gas used: ${this.curGasLimit}. Gas price: ${this.curGasPrice}`)
                    if (retry + 1 !== maxRetries) {
                        await sleep(TX_LOGIC_BY_TRY[retry + 1].wait)
                    }
            }

        }
        this.logger.error(`Tx failed after ${maxRetries} tries. | Last Gas used: ${this.curGasLimit}. Last Gas price: ${this.curGasPrice}`)
        return TxResult.Fail
    }


    private async _sendTransaction(curSigner: ethers.Wallet, txInteraction: TxInteraction): Promise<TxResult> {
        const tx = await curSigner.sendTransaction({
            to: txInteraction.to,
            data: txInteraction.data,
            value: txInteraction.value,
            gasLimit: this.curGasLimit,
            gasPrice: this.curGasPrice
        })

        this.logger.info(`Mining transaction. TxHash: ${tx.hash}`)

        const receipt: TransactionReceipt | null = await tx.wait()

        if (!receipt) {
            this.logger.warn("Receipt is null.")
            return TxResult.Fail
        }

        this.logger.info(`Mined in block ${receipt.blockNumber}`)

        this.curGasLimit = receipt.gasUsed
        this.curGasPrice = receipt.gasPrice

        if (receipt.status == 1) {
            return TxResult.Success
        } else {
            return TxResult.Fail
        }

    }
}