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