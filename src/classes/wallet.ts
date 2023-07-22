import {TxInteraction} from "./module";
import {sleep} from "../utils/utils";


export enum TxResult {
    Success,
    Fail,
}

const RETRY_LOGIC = [
    {
        wait: 60,
        addGasLimit: 200000
    }
    // ...
]

export interface WalletI {

    getAddress(): string
    sendTransaction(tx: TxInteraction, maxRetries: number): Promise<TxResult>
}

export class Wallet implements WalletI {

    constructor(privateKey: string, withdrawAddress: string | null = null) {

    }

    getAddress(): string {
        return "0x1"
    }

    async sendTransaction(tx: TxInteraction, maxRetries: number = 1) {
        return this._sendTransaction(tx, 0, maxRetries)
    }


    private async _sendTransaction(tx: TxInteraction, curRetry: number, maxRetries: number): Promise<TxResult> {
        try {

            // construct tx (also using +RETRY_LOGIC[curRetry - 1].addGasLimit) if curRetry > 0
            // sending tx
            // wait tx to be mined
            // if tx failed - retry
            // else - return success

            return TxResult.Success
        } catch (e) {
            if (curRetry < maxRetries){
                console.log(`Retrying ${curRetry} more times`)
                await sleep(RETRY_LOGIC[curRetry].wait)
                return this._sendTransaction(tx, curRetry - 1, maxRetries)
            }
            return TxResult.Fail
        }
    }
}