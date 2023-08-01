export class OkxCredentials {
    public readonly apiKey: string
    public readonly passphrase: string
    public readonly secretKey: string

    constructor(apiKey: string, passphrase: string, secretKey: string) {
        this.apiKey = apiKey
        this.passphrase = passphrase
        this.secretKey = secretKey
    }
}

export class AddressInfo {
    public readonly address: string
    public readonly privateKey: string
    public readonly subAccName: string | null
    public readonly withdrawAddress: string | null

    constructor(address: string, privateKey: string, withdrawAddress: string | null, subAccName: string | null) {
        this.address = address
        this.privateKey = privateKey
        this.withdrawAddress = withdrawAddress
        this.subAccName = subAccName
    }
}