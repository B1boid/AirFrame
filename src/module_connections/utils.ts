import {TxInteraction} from "../classes/module";
import {Asset} from "../config/tokens";
import {WalletI} from "../classes/wallet";
import {Destination, zkSyncChain} from "../config/chains";
import * as zk from "zksync-web3";
import {globalLogger} from "../utils/logger";
import {ethers} from "ethers-new";
import {sleep} from "../utils/utils";

// TODO add Currency type
export function getTxForTransfer(ccy: Asset, to: string, amount: number): TxInteraction {
    switch (ccy) {
        case Asset.ETH:
            return {to: to, data: "", value: amount.toString(), stoppable: true, confirmations: 1, name: "eth-transfer"}
        case Asset.USDT:
            return {to: "ContractUSDT", data: "tx data", value: "0", stoppable: true, confirmations: 1, name: "usdt-transfer"}
        case Asset.MATIC:
            return {to: to, data: "", value: amount.toString(), stoppable: true, confirmations: 1, name: "matic-transfer"}
        default:
            throw new Error("Not implemented asset.")
    }
}

const MAX_RETIRES_BALANCE_CHANGED = 90
export async function waitBalanceChanged(wallet: WalletI, provider: ethers.JsonRpcProvider, balanceBefore: bigint, retries: number = MAX_RETIRES_BALANCE_CHANGED): Promise<[boolean, number]> { // status, newBalance
    let retry = 0;
    let newBalance: bigint;
    while (retry < retries) {
            try {
                newBalance = await provider.getBalance(wallet.getAddress())
            } catch (e) {
                globalLogger.connect(wallet.getAddress()).warn(`Failed to fetch new balance. Exception: ${e}`)
                await sleep(10)
                continue
            }
        globalLogger.connect(wallet.getAddress()).info(`Try ${retry + 1}/${retries}. Waiting for balance changing. Old balance:${ethers.formatEther(balanceBefore)}. New balance: ${ethers.formatEther(newBalance)}`)
        if (newBalance != balanceBefore) {
            globalLogger.connect(wallet.getAddress()).success(`Balance changed! New balance: ${ethers.formatEther(newBalance)}`)
            return Promise.resolve([true, Number(newBalance)])
        }
        retry++
        await sleep(45)
    }
    globalLogger.connect(wallet.getAddress()).error(`Balance has not changed after ${retries} tries.`)
    return Promise.resolve([false, 0]);
}