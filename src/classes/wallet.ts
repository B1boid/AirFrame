import {TxInteraction} from "./module";
import {sleep} from "../utils/utils";
import {AbstractProvider, ethers, getDefaultProvider} from "ethers";
import {Blockchains} from "../module_blockchains/blockchain_modules";


export enum TxResult {
    Success,
    Fail,
}

const DEFAULT_GAS_LIMIT = 100000

const TX_LOGIC_BY_TRY = [
    {
        wait: 0,
        addGasLimit: 0
    },
    {
        wait: 60,
        addGasLimit: 2 * DEFAULT_GAS_LIMIT
    }
    // ...
]

export interface WalletI {

    getAddress(): string
    getWithdrawAddress(): string | null
    sendTransaction(tx: TxInteraction, maxRetries: number, chain: Blockchains): Promise<TxResult>
}

export class Wallet implements WalletI {
    signer: ethers.Wallet
    withdrawAddress: string | null

    constructor(privateKey: string, withdrawAddress: string | null = null) {
        this.signer = new ethers.Wallet(privateKey)
        this.withdrawAddress = withdrawAddress
    }

    getAddress(): string {
        return this.signer.address
    }

    getWithdrawAddress(): string | null {
        return this.withdrawAddress
    }

    async sendTransaction(txInteraction: TxInteraction, maxRetries: number = 1, chain: Blockchains): Promise<TxResult> {
        const provider: AbstractProvider = getDefaultProvider(chain)
        const curSigner: ethers.Wallet = this.signer.connect(provider)

        const gasLimit = await provider.estimateGas({
            from: curSigner.address,
            to: txInteraction.to,
            data: txInteraction.data,
            value: txInteraction.value
        });

        for (let retry = 0; retry < maxRetries + 1; retry++) {
            const result: TxResult = await this._sendTransaction(curSigner, txInteraction, chain,
                Number(gasLimit) + TX_LOGIC_BY_TRY[retry].addGasLimit)
            switch (result) {
                case TxResult.Success:
                    return TxResult.Success
                case TxResult.Fail:
                    if (retry + 1 !== maxRetries) {
                        await sleep(TX_LOGIC_BY_TRY[retry + 1].addGasLimit)
                    }
            }

        }
        return TxResult.Fail
    }


    private async _sendTransaction(curSigner: ethers.Wallet, txInteraction: TxInteraction,
                                   chain: Blockchains, gasLimit: number): Promise<TxResult> {
        const tx = await curSigner.sendTransaction({
            to: txInteraction.to,
            data: txInteraction.data,
            value: txInteraction.value,
            gasLimit: gasLimit
        })

        console.log("Mining transaction...");
        console.log(`https://${chain}.etherscan.io/tx/${tx.hash}`);

        const receipt = await tx.wait();

        if (!receipt) {
            console.log("Receipt is null.")
            return TxResult.Fail
        }

        console.log(`Mined in block ${receipt.blockNumber}`);
        return TxResult.Success
    }
}