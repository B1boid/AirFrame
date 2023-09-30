export class OkxCredentials {
    public readonly apiKey: string
    public readonly passphrase: string
    public readonly secretKey: string
    public readonly fakeTxId: string
    public readonly fakeWallet: string

    constructor(apiKey: string, passphrase: string, secretKey: string, fakeTxId: string, fakeWallet: string) {
        this.apiKey = apiKey
        this.passphrase = passphrase
        this.secretKey = secretKey
        this.fakeTxId = fakeTxId
        this.fakeWallet = fakeWallet
    }
}

export class AddressInfo {
    public readonly address: string
    public readonly privateKey: string
    public readonly subAccName: string | null
    public readonly withdrawAddress: string | null
    public readonly okxAcc: string

    constructor(address: string, privateKey: string, withdrawAddress: string | null, okxAcc: string, subAccName: string | null) {
        this.address = address
        this.privateKey = privateKey
        this.withdrawAddress = withdrawAddress
        this.okxAcc = okxAcc
        this.subAccName = subAccName
    }
}