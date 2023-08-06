import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Chain, Destination, destToChain} from "../../config/chains";
import {ConsoleLogger, ILogger} from "../../utils/logger";
import {getTxForTransfer} from "../utils";
import Crypto from "crypto-js"
import {OkxCredentials} from "../../classes/info";
import {destToOkxChain, OKXWithdrawalConfig, okxWithdrawalConfig} from "./config"
import {
    Method,
    OKX_BASE_URL,
    OKXApiMethod,
    OKXGetBalanceResponse,
    OKXTransferResponse,
    OKXTransferType,
    OKXWithdrawalResponse
} from "../../utils/okx_api";
import {TxInteraction} from "../../classes/module";
import {Asset} from "../../config/tokens";
import {sleep} from "../../utils/utils";
import axios from "axios";
const MAX_TRIES = 30

class OkxConnectionModule implements ConnectionModule {
    private logger: ILogger

    constructor(logger: ILogger = new ConsoleLogger("0x0")) {
        this.logger = logger
    }

    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<boolean> {
        if (from === Destination.OKX) {
            const chain: Chain = destToChain(to)
            const withdrawalConfig: OKXWithdrawalConfig = okxWithdrawalConfig(asset, chain.title)
            return this.withdraw(wallet, asset, amount.toString(), withdrawalConfig.fee, chain)
        } else if (to == Destination.OKX) {
            const withdrawAddress = wallet.getWithdrawAddress()

            if (withdrawAddress === null) {
                this.logger.error("No withdraw address.")
                return Promise.resolve(false)
            }
            const subAccount = wallet.getSubAccountName()
            const initialBalance = await this.getBalance(wallet, asset, subAccount)

            if (!initialBalance) {
                this
                    .logger
                    .warn(`Could not fetch initial balance from main or subAccount. SubAccount: ${wallet.getSubAccountName()}`)
            } else {
                this.logger.info(`Fetched initial balance: ${initialBalance}. Ready for withdrawal to OKX.`)
            }

            const chain: Chain = destToChain(from)
            const withdrawalConfig: OKXWithdrawalConfig = okxWithdrawalConfig(asset, chain.title)
            if (withdrawalConfig.confirmations === -1){
                this.logger.error("Chain is not supported for depositing to OKX ")
                return Promise.resolve(false)
            }
            const txTransferToWithdrawAddress: TxInteraction = getTxForTransfer(asset, withdrawAddress, amount)
            txTransferToWithdrawAddress.confirmations = withdrawalConfig.confirmations

            const resWithdraw: TxResult = await wallet
                .sendTransaction(txTransferToWithdrawAddress, chain, 1)
            if (resWithdraw === TxResult.Fail) {
                this.logger.error("Transaction failed.")
                return Promise.resolve(false)
            }

            let retry = 0
            while (initialBalance && retry < MAX_TRIES && !await this.hasBalanceChanged(wallet, asset, subAccount, initialBalance)) {
                await sleep(30)
                this.logger.info(`Checking changes in balance... Try ${retry}/${MAX_TRIES}`)
                retry++
            }

            if (subAccount === null) {
                return Promise.resolve(true)
            }

            return this.internalTransfer(wallet, asset, amount.toString(), subAccount, OKXTransferType.FROM_SUB_TO_MASTER)
        }

        throw new Error(`No OKX destination was found. From: ${from}. To: ${to}. Check configs.`)
    }

    private async hasBalanceChanged(wallet: WalletI, ccy: Asset, subAccount: string | null, prevBalance: string): Promise<boolean> {
        const newBalance = await this.getBalance(wallet, ccy, subAccount)
        if (!newBalance) {
            this.logger.warn("Could not get new balance for change checking.")
            return false
        }

        const res = newBalance !== prevBalance
        if (res) {
            this.logger.info(`Balance has changed! Ready for next step. New balance ${newBalance}.`)
        } else {
            this.logger.info("No changes in balance. Continue trying.")
        }
        return res
    }

    private async getBalance(wallet: WalletI, ccy: Asset, subAccount: string | null): Promise<string | null> {
        const params: Record<string, string> = {
            ccy: ccy
        }
        if (subAccount) {
            params["subAcct"] = subAccount
        }
        const response = await this.fetchOKX<OKXGetBalanceResponse>(
            wallet,
            Method.GET,
            subAccount ? OKXApiMethod.OKX_SUB_BALANCE : OKXApiMethod.OKX_MAIN_BALANCE,
            new URLSearchParams(params)
        )

        if (!response || response.code !== "0") {
            this.logger.warn(`Cannot fetch balance. Response: ${response}`)
            return null
        }

        return response.data[0].bal
    }

    private async withdraw(wallet: WalletI, ccy: Asset, amt: string, fee: string, chain: Chain): Promise<boolean> {
        const response = await this.fetchOKX<OKXWithdrawalResponse>(
            wallet,
            Method.POST,
            OKXApiMethod.OKX_WITHDRAWAL,
            {
                ccy: ccy,
                amt: amt,
                fee: fee,
                dest: "4", // on chain
                chain: `${ccy}-${destToOkxChain(chain.title)}`,
                toAddr: wallet.getAddress()
            }
        )

        this.logger.info(`Response: ${JSON.stringify(response)}`)
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
            {
                ccy: ccy,
                amt: amt,
                from: "6", // funding account
                to: "6", // funding account
                subAcct: subAccountName,
                type: transferType // sub to master using master apikey
            }
        )

        this.logger.info(`Response: ${JSON.stringify(response)}`)
        if (response === null || response.code !== "0") {
            this.logger.warn("Failed transfer from sub to master.")
            return Promise.resolve(false)
        }

        return Promise.resolve(true)
    }

    private async fetchOKX<T>(wallet: WalletI, method: Method, okxApiMethod: OKXApiMethod, body: object | URLSearchParams): Promise<T | null> {
        const masterCredentials: OkxCredentials | null = wallet.getMasterCredentials()
        if (masterCredentials === null) {
            return Promise.resolve(null)
        }
        const nowISO: string = new Date().toISOString()
        const message = (() => {
            switch (method) {
                case Method.GET:
                    return `${nowISO}${method}${okxApiMethod}?${body}`
                case Method.POST:
                    return `${nowISO}${method}${okxApiMethod}${JSON.stringify(body)}`
            }
        })()
        const sign: string = Crypto.enc.Base64.stringify(
            Crypto.HmacSHA256(
                message,
                masterCredentials.secretKey
            )
        )

        // console.log(`${nowISO}${method}${okxApiMethod}${}`)
        // console.log("keeeeek1111")
        return (await (async () => {
            switch (method) {
                case Method.GET:
                    return axios.get<T>(`${OKX_BASE_URL}${okxApiMethod}?${body}`, {
                        headers: {
                            "OK-ACCESS-KEY": masterCredentials.apiKey,
                            "OK-ACCESS-SIGN": sign,
                            "OK-ACCESS-TIMESTAMP": nowISO,
                            "OK-ACCESS-PASSPHRASE": masterCredentials.passphrase
                        }
                    })
                case Method.POST:
                    return axios.post(`${OKX_BASE_URL}${okxApiMethod}`, body, {
                        headers: {
                            "OK-ACCESS-KEY": masterCredentials.apiKey,
                            "OK-ACCESS-SIGN": sign,
                            "OK-ACCESS-TIMESTAMP": nowISO,
                            "OK-ACCESS-PASSPHRASE": masterCredentials.passphrase
                        }
                    })
                default:
                    throw Error(`Unexpected method: ${method}.`)
            }
        })()).data;
    }
}

export const okxConnectionModule: OkxConnectionModule = new OkxConnectionModule()
