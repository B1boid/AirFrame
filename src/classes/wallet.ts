

export interface WalletI {
    sendTransaction(): Promise<void>
}

export class Wallet implements WalletI{

    constructor(privateKey: string, withdrawAddress: string | null = null) {

    }


    async sendTransaction() {

    }
}