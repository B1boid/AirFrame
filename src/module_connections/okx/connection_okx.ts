import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Chain, Destination, destToChain} from "../../config/chains";
import {ConsoleLogger, ILogger} from "../../utils/logger";
import {getTxForTransfer} from "../utils";
import {Asset} from "../../classes/actions";
import Crypto from "crypto-js"
import {OkxCredentials} from "../../classes/okx";
import {
    Method,
    OKX_BASE_URL,
    OKXApiMethod,
    OKXTransferResponse,
    OKXTransferType,
    OKXWithdrawalResponse
} from "../../utils/okx_api";
import {TxInteraction} from "../../classes/module";

const WITHDRAWAL_FEE = "0.0005" // TODO hz skok nado
class OkxConnectionModule implements ConnectionModule {
    private logger: ILogger

    constructor(logger: ILogger = new ConsoleLogger("0x0")) {
        this.logger = logger
    }
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<boolean> {
        if (from === Destination.OKX) {
            const chain: Chain = destToChain.get(to)!
            return this.withdraw(wallet, asset, amount.toString(), WITHDRAWAL_FEE, chain)
        } else if (to == Destination.OKX) {
            const withdrawAddress = wallet.getWithdrawAddress()

            if (withdrawAddress === null) {
                this.logger.error("No withdraw address.")
                return Promise.resolve(false)
            }

            const txTransferToWithdrawAddress: TxInteraction = getTxForTransfer(asset, withdrawAddress, amount)
            const chain: Chain = destToChain.get(from)!

            const resWithdraw: TxResult = await wallet
                .sendTransaction(txTransferToWithdrawAddress, 1, chain)
            if (resWithdraw === TxResult.Fail) {
                this.logger.error("Transaction failed.")
                return Promise.resolve(false)
            }

            const subName: string | null = wallet.getSubAccountName()
            if (subName === null) {
                return Promise.resolve(true)
            }

            return this.internalTransfer(wallet, asset, amount.toString(), subName, OKXTransferType.FROM_SUB_TO_MASTER)
        }

        throw new Error(`No OKX destination was found. From: ${from}. To: ${to}. Check configs.`)
    }

    private async withdraw(wallet: WalletI, ccy: Asset, amt: string, fee: string, chain: Chain): Promise<boolean> {
        const response = await this.fetchOKX<OKXWithdrawalResponse>(
            wallet,
            Method.POST,
            OKXApiMethod.OKX_WITHDRAWAL,
            new URLSearchParams({
                ccy: ccy,
                amt: amt,
                dest: "4", // on chain
                toAddr: wallet.getAddress(),
                fee: fee,
                chain: `${ccy}-${chain.title}`
            })
        )

        this.logger.info(`Response: ${response}`)
        if (response === null || response.code !== "0") {
            this.logger.warn("Withdrawal failed.")
            return Promise.resolve(false)
        }

        return Promise.resolve(true)
    }

    private async internalTransfer(wallet: WalletI, ccy: Asset, amt: string,
                                   subAccountName: string, transferType: OKXTransferType): Promise<boolean> {
        const response = await this.fetchOKX<OKXTransferResponse>(
            wallet,
            Method.POST,
            OKXApiMethod.OKX_TRANSFER,
            new URLSearchParams({
                ccy: ccy,
                amt: amt,
                from: "6", // funding account
                to: "6", // funding account
                subAcct: subAccountName,
                type: transferType // sub to master using master apikey
            })
        )

        this.logger.info(`Response: ${response}`)
        if (response === null || response.code !== "0") {
            this.logger.warn("Failed transfer from sub to master.")
            return Promise.resolve(false)
        }

        return Promise.resolve(true)
    }

    private async fetchOKX<T>(wallet: WalletI, method: Method, okxApiMethod: OKXApiMethod, params: URLSearchParams): Promise<T | null> {
        const masterCredentials: OkxCredentials | null = wallet.getMasterCredentials()
        if (masterCredentials === null) {
            return Promise.resolve(null)
        }
        const nowISO: string = new Date().toISOString()
        const sign: string = Crypto.enc.Base64.stringify(
            Crypto.HmacSHA256(
                `${nowISO}${method}${okxApiMethod}?${params}`,
                masterCredentials.secretKey
            )
        )

        const addresses: Response = await fetch(`${OKX_BASE_URL}${okxApiMethod}?${params}`, {
            method: method,
            headers: {
                "OK-ACCESS-KEY": masterCredentials.apiKey,
                "OK-ACCESS-SIGN": sign,
                "OK-ACCESS-TIMESTAMP": nowISO,
                "OK-ACCESS-PASSPHRASE": masterCredentials.passphrase
            }
        })
        return await addresses.json() as T
    }
}

export const okxConnectionModule: OkxConnectionModule = new OkxConnectionModule()
