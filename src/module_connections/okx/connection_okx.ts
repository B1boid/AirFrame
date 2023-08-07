import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Blockchains, Chain, Destination, destToChain} from "../../config/chains";
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
    OKXGetDepositWithdrawalStatusResponse,
    OKXTransferResponse,
    OKXTransferType,
    OKXWithdrawalResponse
} from "../../utils/okx_api";
import {TxInteraction} from "../../classes/module";
import {Asset} from "../../config/tokens";
import {sleep} from "../../utils/utils";
import axios from "axios";
import {ethers} from "ethers-new";

const MAX_TRIES = 30

enum DepositWithdrawType {
    DEPOSIT,
    WITHDRAW
}

class OkxConnectionModule implements ConnectionModule {
    private logger: ILogger

    constructor(logger: ILogger = new ConsoleLogger("0x0")) {
        this.logger = logger
    }

    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<boolean> {
        if (from === Destination.OKX) {
            const chain: Chain = destToChain(to)
            const withdrawalConfig: OKXWithdrawalConfig = okxWithdrawalConfig(asset, chain.title)
            const [withdrawSubmitStatus, wdId] = await this.withdraw(wallet, asset, amount.toString(), withdrawalConfig.fee, chain)

            if (!withdrawSubmitStatus) {
                this.logger.error("Something went wrong during withdrawal creation.")
                return Promise.resolve(false)
            }

            const submitStatus = await this.depositWithdrawFinished(
                wallet,
                wdId,
                asset,
                chain.title,
                DepositWithdrawType.WITHDRAW
            )

            if (!submitStatus) {
                this.logger.error("Could not fetch successful withdrawal. Check logs.")
            } else {
                this.logger.success(`Successful withdrawal from OKX to ${to}.`)
            }

            return Promise.resolve(submitStatus)
        } else if (to == Destination.OKX) {
            const withdrawAddress = wallet.getWithdrawAddress()

            if (withdrawAddress === null) {
                this.logger.error("No withdraw address.")
                return Promise.resolve(false)
            }
            const subAccount = wallet.getSubAccountName()!

            const chain: Chain = destToChain(from)
            const withdrawalConfig: OKXWithdrawalConfig = okxWithdrawalConfig(asset, chain.title)
            if (withdrawalConfig.confirmations === -1) {
                this.logger.error("Chain is not supported for depositing to OKX ")
                return Promise.resolve(false)
            }
            const txTransferToWithdrawAddress: TxInteraction = getTxForTransfer(asset, withdrawAddress, amount)
            txTransferToWithdrawAddress.confirmations = withdrawalConfig.confirmations

            const [resWithdraw, txHash]: [TxResult, string] = await wallet.sendTransaction(txTransferToWithdrawAddress, chain, 1)
            if (resWithdraw === TxResult.Fail) {
                this.logger.error("Transaction failed.")
                return Promise.resolve(false)
            }


            const submitStatus = await this.depositWithdrawFinished(
                wallet,
                txHash,
                asset,
                chain.title,
                DepositWithdrawType.DEPOSIT
            )

            if (!submitStatus) {
                this.logger.error("Could not fetch successful deposit. Check logs.")
            } else {
                this.logger.success("Successful deposit. Balance updated.")
            }

            if (subAccount === null) {
                return Promise.resolve(true)
            }

            return this.internalTransfer(wallet, asset, amount.toString(), subAccount, OKXTransferType.FROM_SUB_TO_MASTER)
        }

        throw new Error(`No OKX destination was found. From: ${from}. To: ${to}. Check configs.`)
    }

    private async depositWithdrawFinished(wallet: WalletI, txOrWdId: string, ccy: Asset, chain: Blockchains,
                                          opType: DepositWithdrawType): Promise<boolean> {
        this.logger.info(`Waiting for tx/wd ${txOrWdId} to complete on OKX.`)
        const check = (() => this.fetchOKX<OKXGetDepositWithdrawalStatusResponse>(
            wallet,
            Method.GET,
            OKXApiMethod.OKX_DEPOSIT_WITHDRAW_STATUS,
            opType === DepositWithdrawType.DEPOSIT && wallet.getSubAccountCredentials() ?
                wallet.getSubAccountCredentials() : wallet.getMasterCredentials(),
            new URLSearchParams(opType === DepositWithdrawType.DEPOSIT ?
                {txId: txOrWdId, ccy: ccy, to: wallet.getAddress(), chain: `${ccy}-${destToOkxChain(chain)}`} :
                {wdId: txOrWdId}
            )
        ))
        let retry = 0
        let changed: OKXGetDepositWithdrawalStatusResponse | null = await check()
        const successStatus = opType === DepositWithdrawType.DEPOSIT ?
            "Deposit complete" : "Withdrawal complete"
        while (retry < MAX_TRIES && (!changed || changed.code !== "0" || !changed.data[0]?.state.startsWith(successStatus))) {
            this.logger.info(`Checking if tx/wd ${txOrWdId} is completed. Last status: ${changed?.data[0]?.state}. Try ${retry + 1}/${MAX_TRIES}.`)
            if (retry !== 0) {
                await sleep(30)
                changed = await check()
            }
            retry++
        }

        if (changed === null) {
            this.logger.error(`Final status fetch: ${JSON.stringify(changed)}.`)
            return Promise.resolve(false)
        }

        this.logger.success(`Final status fetch: ${JSON.stringify(changed)}.`)
        return Promise.resolve(changed.code === "0" && changed.data[0].state.split(":")[0] === successStatus)
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
            wallet.getMasterCredentials(),
            new URLSearchParams(params)
        )

        if (!response || response.code !== "0") {
            this.logger.warn(`Cannot fetch balance. Response: ${response}`)
            return null
        }

        return response.data[0].bal
    }

    private async withdraw(wallet: WalletI, ccy: Asset, amt: string, fee: string, chain: Chain): Promise<[boolean, string]> {
        const response = await this.fetchOKX<OKXWithdrawalResponse>(
            wallet,
            Method.POST,
            OKXApiMethod.OKX_WITHDRAWAL,
            wallet.getMasterCredentials(),
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
            return Promise.resolve([false, ""])
        }

        return Promise.resolve([true, response.data[0].wdId])
    }

    private async internalTransfer(wallet: WalletI, ccy: Asset, amt: string,
                                   subAccountName: string, transferType: OKXTransferType): Promise<boolean> {
        const response = await this.fetchOKX<OKXTransferResponse>(
            wallet,
            Method.POST,
            OKXApiMethod.OKX_TRANSFER,
            wallet.getMasterCredentials(),
            {
                ccy: ccy,
                amt: ethers.formatEther(amt).toString(),
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

        this.logger.success("Successfully transferred assets from sub to master.")

        // TODO maybe add waiting for funds transfer (but it seems fast)

        return Promise.resolve(true)
    }

    private async fetchOKX<T>(wallet: WalletI, method: Method, okxApiMethod: OKXApiMethod,
                              credentials: OkxCredentials | null, body: object | URLSearchParams): Promise<T | null> {
        if (credentials === null) {
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
                credentials.secretKey
            )
        )

        return (await (async () => {
            switch (method) {
                case Method.GET:
                    return axios.get<T>(`${OKX_BASE_URL}${okxApiMethod}?${body}`, {
                        headers: {
                            "OK-ACCESS-KEY": credentials.apiKey,
                            "OK-ACCESS-SIGN": sign,
                            "OK-ACCESS-TIMESTAMP": nowISO,
                            "OK-ACCESS-PASSPHRASE": credentials.passphrase
                        }
                    })
                case Method.POST:
                    return axios.post(`${OKX_BASE_URL}${okxApiMethod}`, body, {
                        headers: {
                            "OK-ACCESS-KEY": credentials.apiKey,
                            "OK-ACCESS-SIGN": sign,
                            "OK-ACCESS-TIMESTAMP": nowISO,
                            "OK-ACCESS-PASSPHRASE": credentials.passphrase
                        }
                    })
                default:
                    throw Error(`Unexpected method: ${method}.`)
            }
        })()).data;
    }
}

export const okxConnectionModule: OkxConnectionModule = new OkxConnectionModule()
