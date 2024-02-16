import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Blockchains, Chain, Destination, ethereumChain} from "../../config/chains";
import {globalLogger} from "../../utils/logger";
import {getTxForTransfer} from "../utils";
import Crypto from "crypto-js"
import {OkxCredentials} from "../../classes/info";
import {destToOkxChain, OKXWithdrawalConfig, okxWithdrawalConfig} from "./config"
import {
    Method,
    OKX_BASE_URL,
    OKXApiMethod,
    OKXGetBalanceResponse, OKXGetCurrenciesResponse,
    OKXGetDepositWithdrawalStatusResponse,
    OKXTransferResponse,
    OKXTransferType,
    OKXWithdrawalResponse
} from "../../utils/okx_api";
import {TxInteraction} from "../../classes/module";
import {Asset} from "../../config/tokens";
import {getRandomKeepAmount, getTxDataForAllBalanceTransfer, getZkSyncKeepRandomAmount, needToStop, retry, sleep} from "../../utils/utils";
import axios from "axios";
import {ethers} from "ethers-new";
import {destToChain} from "../../module_blockchains/blockchain_modules";
import {allGases} from "../../config/online_config";

const MAX_TRIES = 30
const DEFAULT_GAS_PRICE = ethers.parseUnits("20", "gwei")
const EXTRA_GAS_LIMIT = 10_000

enum DepositWithdrawType {
    DEPOSIT,
    WITHDRAW
}

class OkxConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<[boolean, number]> {
        if (from === Destination.OKX) {
            const chain: Chain = destToChain(to)
            const fee: string = await this.getMinFee(wallet, asset, chain.title)

            if (amount === -1) {
                const okxAssetBalance = await this.getBalance(wallet, asset, null) // get master balance for withdrawal

                if (okxAssetBalance === null) {
                    globalLogger.connect(wallet.getAddress(), chain).error("Failed fetching OKX balance for full withdrawal.")
                    return Promise.resolve([false, 0])
                }
                amount = Number(okxAssetBalance) - Number(fee) // TODO
            }


            const [withdrawSubmitStatus, wdId] = await this.withdraw(wallet, asset, amount.toString(), fee, chain)

            if (!withdrawSubmitStatus) {
                globalLogger.connect(wallet.getAddress(), chain).error("Something went wrong during withdrawal creation.")
                return Promise.resolve([false, 0])
            }

            const submitStatus = await this.depositWithdrawFinished(
                wallet,
                wdId,
                asset,
                chain.title,
                DepositWithdrawType.WITHDRAW
            )

            if (!submitStatus) {
                globalLogger.connect(wallet.getAddress(), chain).error("Could not fetch successful withdrawal. Check logs.")
            } else {
                globalLogger.connect(wallet.getAddress(), chain).done(`Successful withdrawal from OKX to ${to}.`)
            }

            return Promise.resolve([submitStatus, amount])
        } else if (to == Destination.OKX) {
            const withdrawAddress = wallet.getWithdrawAddress()
            const chain: Chain = destToChain(from)

            if (withdrawAddress === null) {
                globalLogger.connect(wallet.getAddress(), chain).error("No withdraw address.")
                return Promise.resolve([false, 0])
            }
            const subAccount = wallet.getSubAccountName()

            const okxBalanceBefore = await retry( () => {
                return this.getBalance(wallet, asset, subAccount)
            }, MAX_TRIES)

            if (!okxBalanceBefore) {
                globalLogger.connect(wallet.getAddress(), chain).error("Could not fetch OKX old balance")
                return Promise.resolve([false, 0])
            }

            const withdrawalConfig: OKXWithdrawalConfig = okxWithdrawalConfig(asset, chain.title)
            if (withdrawalConfig.confirmations === -1) {
                globalLogger.connect(wallet.getAddress(), chain).error("Chain is not supported for depositing to OKX ")
                return Promise.resolve([false, 0])
            }


            const response: [TxResult, string] | null = (await retry(async (i) => {
                const [bigAmount, txTransferToWithdrawAddress] = await this.buildTransferToOkx(wallet, amount, withdrawAddress,
                    asset, chain, i * EXTRA_GAS_LIMIT, ethers.parseUnits(`${allGases[chain.title]}`, "gwei"))

                txTransferToWithdrawAddress.confirmations = withdrawalConfig.confirmations

                const [res, txHash] = await wallet.sendTransaction(txTransferToWithdrawAddress, chain, 1)
                return res === TxResult.Fail ? null : [res, txHash]
            }, MAX_TRIES))

            if (response === null) {
                globalLogger.connect(wallet.getAddress(), chain).error("Transaction failed.")
                return Promise.resolve([false, 0])
            }

            const [resWithdraw, txHash] = response

            const submitStatus = await this.depositWithdrawFinished(
                wallet,
                txHash,
                asset,
                chain.title,
                DepositWithdrawType.DEPOSIT
            )

            if (!submitStatus) {
                globalLogger.connect(wallet.getAddress(), chain).error("Could not fetch successful deposit. Check logs.")
            } else {
                globalLogger.connect(wallet.getAddress(), chain).done("Successful deposit. Balance updated.")
            }


            const [status, newBalance] = await this.waitOkxBalanceChange(wallet, asset, okxBalanceBefore)

            if (!status) {
                return Promise.resolve([false, 0])
            }

            if (subAccount === null) {
                return Promise.resolve([true, newBalance - Number(okxBalanceBefore)])
            }

            return this.internalTransfer(wallet, asset, newBalance.toString(), subAccount, OKXTransferType.FROM_SUB_TO_MASTER)
        }

        throw new Error(`No OKX destination was found. From: ${from}. To: ${to}. Check configs.`)
    }

    private async buildTransferToOkx(wallet: WalletI, amount: number, withdrawAddress: string, asset: Asset, chain: Chain, extraGasLimit: number, defaultGasPrice: bigint): Promise<[bigint, TxInteraction]> {
        if (amount === -1) {
            return await getTxDataForAllBalanceTransfer(wallet, withdrawAddress, asset, chain, extraGasLimit, defaultGasPrice)
        } else {
            let bigAmount = ethers.parseEther(`${amount}`)
            if (chain.title == Blockchains.ZkSync && getZkSyncKeepRandomAmount()){
                let keepAmount = getRandomKeepAmount()
                bigAmount = bigAmount - (keepAmount > bigAmount ? bigAmount * BigInt(20) / BigInt(100) : keepAmount)
                globalLogger
                    .connect(wallet.getAddress(), chain)
                    .info(`ZkSync keep amount: ${keepAmount.toString()}. To transfer: ${bigAmount.toString()}`)
            }
            const txTransferToWithdrawAddress = getTxForTransfer(asset, withdrawAddress, bigAmount)
            return Promise.resolve([bigAmount, txTransferToWithdrawAddress])
        }
    }

    private async waitOkxBalanceChange(wallet: WalletI, asset: Asset, okxBalanceBefore: string): Promise<[boolean, number]> { // status, balance
        const logger =  globalLogger.connect(wallet.getAddress(), ethereumChain)
        let i = 0;
        while (i < MAX_TRIES) {
            const newBalance = await this.getBalance(wallet, asset, wallet.getSubAccountName())
            logger.info(`Try ${i}/${MAX_TRIES} fetch changed OKX balance. Old balance: ${okxBalanceBefore}. New fetched balance: ${newBalance === null ? -1 : newBalance}`)

            if (!newBalance) {
                logger.warn("Null new balance. Retrying...")
                continue
            }

            if (Number(newBalance) > Number(okxBalanceBefore)) {
                return Promise.resolve([true, Number(newBalance)])
            }

            i++
        }

        logger.error("Failed to fetch new OKX balance. Terminating...")
        return Promise.resolve([false, 0])
    }

    private async depositWithdrawFinished(wallet: WalletI, txOrWdId: string, ccy: Asset, chain: Blockchains,
                                          opType: DepositWithdrawType): Promise<boolean> {
        const blockchain = destToChain(chain)
        globalLogger.connect(wallet.getAddress(), blockchain).info(`Waiting for tx/wd ${txOrWdId} to complete on OKX.`)
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
            globalLogger.connect(wallet.getAddress(), blockchain).info(`Checking if tx/wd ${txOrWdId} is completed. Last status: ${changed?.data[0]?.state}. Try ${retry + 1}/${MAX_TRIES}.`)
            if (retry !== 0) {
                await sleep(60)
                changed = await check()
            }
            if (changed && changed.code === "0" && (changed.data[0]?.state.includes("Node is upgrading") || changed.data[0]?.state.includes("On Hold"))) {
                globalLogger.connect(wallet.getAddress(), blockchain).warn("Deposit on hold. Same retry.")
                await sleep(60)
                continue
            }
            retry++
        }

        if (changed === null) {
            globalLogger.connect(wallet.getAddress(), blockchain).error(`Final status fetch: ${JSON.stringify(changed)}.`)
            return Promise.resolve(false)
        }

        globalLogger.connect(wallet.getAddress(), blockchain).done(`Final status fetch: ${JSON.stringify(changed)}.`)
        return Promise.resolve(changed.code === "0" && changed.data[0].state.split(":")[0] === successStatus)
    }

    private async getMinFee(wallet: WalletI, ccy: Asset, blockchain: Blockchains): Promise<string> {
        const params: Record<string, string> = {
            ccy: ccy
        }
        const response = await this.fetchOKX<OKXGetCurrenciesResponse>(
            wallet,
            Method.GET,
            OKXApiMethod.OKX_GET_CURRENCIES,
            wallet.getMasterCredentials(),
            new URLSearchParams(params)
        )
        if (!response || response.code !== "0") {
            globalLogger.connect(wallet.getAddress(), ethereumChain).warn(`Cannot get fee data. Fallback to default value. Response: ${response}`)
            return okxWithdrawalConfig(ccy, blockchain).fee
        }

        const destOkxChain = destToOkxChain(blockchain)
        const neededFee = response
            .data
            .find(x => x.chain === `${ccy}-${destOkxChain}`)

        if (!neededFee) {
            globalLogger.connect(wallet.getAddress(), ethereumChain).warn(`Cannot find chain in fee data. Fallback to default value. Response: ${response}`)
            return okxWithdrawalConfig(ccy, blockchain).fee
        }
        globalLogger.connect(wallet.getAddress(), ethereumChain).warn(`Fetched okx minFee. Response: ${neededFee.minFee}`)
        return neededFee.minFee
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
            globalLogger.connect(wallet.getAddress(), ethereumChain).warn(`Cannot fetch balance. Response: ${response}`)
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

        globalLogger.connect(wallet.getAddress(), chain).info(`Response: ${JSON.stringify(response)}`)
        if (response === null || response.code !== "0") {
            globalLogger.connect(wallet.getAddress(), chain).warn(`Withdrawal failed. Response: ${JSON.stringify(response)}`)
            if (!needToStop() && (response !== null && response.msg.startsWith("Withdrawals suspended") || response === null)) {
                globalLogger.connect(wallet.getAddress(), chain).warn("Withdrawals suspended or response is null. Waiting and trying again later.")
                await sleep(60 * 60) // 1 hour
                return this.withdraw(wallet, ccy, amt, fee, chain)
            }
            return Promise.resolve([false, ""])
        }

        return Promise.resolve([true, response.data[0].wdId])
    }

    private async internalTransfer(wallet: WalletI, ccy: Asset, amt: string,
                                   subAccountName: string, transferType: OKXTransferType): Promise<[boolean, number]> {
        const response = await this.fetchOKX<OKXTransferResponse>(
            wallet,
            Method.POST,
            OKXApiMethod.OKX_TRANSFER,
            wallet.getMasterCredentials(),
            {
                ccy: ccy,
                amt: amt,
                from: "6", // funding account
                to: "6", // funding account
                subAcct: subAccountName,
                type: transferType // sub to master using master apikey
            }
        )

        globalLogger.connect(wallet.getAddress(), ethereumChain).info(`From sub to master: ${amt}`)
        globalLogger.connect(wallet.getAddress(), ethereumChain).info(`Response: ${JSON.stringify(response)}`)
        if (response === null || response.code !== "0") {
            globalLogger.connect(wallet.getAddress(), ethereumChain).warn("Failed transfer from sub to master.")
            return Promise.resolve([false, 0])
        }

        globalLogger.connect(wallet.getAddress(), ethereumChain).done("Successfully transferred assets from sub to master.")

        // TODO maybe add waiting for funds transfer (but it seems fast)

        return Promise.resolve([true, Number(amt)])
    }

    private async fetchOKX<T>(wallet: WalletI, method: Method, okxApiMethod: OKXApiMethod,
                              credentials: OkxCredentials | null, body: object | URLSearchParams): Promise<T | null> {
        try {
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
        } catch (e) {
            globalLogger.warn(`Failed fetch OKX: ${e}`)
            await sleep(10)
            return null
        }
    }
}

export const okxConnectionModule: OkxConnectionModule = new OkxConnectionModule()
