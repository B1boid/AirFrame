import {TxInteraction} from "./module";


export interface WalletI {
    sendTransaction(tx: TxInteraction): Promise<void>
}

export class Wallet implements WalletI{

    constructor(privateKey: string, withdrawAddress: string | null = null) {

    }


    async sendTransaction(tx: TxInteraction) {

    }
}