import {AddressInfo, OkxCredentials} from "../classes/info";
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import CryptoJS from "crypto-js/core";
import {ethers} from "ethers-new";
import {globalLogger} from "./logger";
import {getFeeData, getGasLimit, getL1Cost} from "./gas";
import {getTxForTransfer} from "../module_connections/utils";
import {UnionProvider, WalletI} from "../classes/wallet";
import {Blockchains, Chain} from "../config/chains";
import {Asset} from "../config/tokens";
import {TxInteraction} from "../classes/module";
import * as zk from "zksync-web3";
import {NATIVE_ADDRESS} from "../common_blockchain/routers/common";
import {Limits} from "../config/run_config";
import {AnyActions, WalletActions} from "../classes/actions";
import {BigNumber} from "ethers";
dotenv.config();

export type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]: U;
};

export function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}

export function sleepWithLimits(limit: Limits): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * getRandomInt(limit.min, limit.max)));
}

export function getCurTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomNearInt(value: number, percent: number = 10): number {
    return getRandomInt(Math.floor(value - value * percent / 100), Math.floor(value + value * percent / 100));
}

export function getRandomizedPercent(value: bigint, minPercent: number, maxPercent: number): bigint {
    const randomPercent = getRandomInt(minPercent, maxPercent);
    return value * BigInt(randomPercent) / BigInt(100);
}

export function getRandomFloat(min: number, max: number, decimals: number): number {
    const str = (Math.random() * (max - min) + min).toFixed(
        decimals,
    );
    return parseFloat(str);
}

export function formatIfNativeToken(address: string){
    if (address === NATIVE_ADDRESS) {
        return "0x0000000000000000000000000000000000000000"
    }
    return address
}

export function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function getRandomElement<T> (list: T[]) {
    return list[Math.floor((Math.random()*list.length))];
}

export function printActions(walletActions: WalletActions){
    let result = "";
    if (walletActions.featuresLine){
        result += `${walletActions.featuresLine}\n`
    }
    for (const action of walletActions.actions){
        if ("connectionName" in action) {
            result += `${action.from} -> ${action.to}  ${action.amount} ${action.asset} : ${action.connectionName}\n`
        } else {
            result += `${action.chainName} [${action.activityNames.join(", ")}]\n`
        }
    }
    globalLogger.done(`Starting actions:\n${result}`)
}

export function getActiveAddresses(): string[] {
    const file = readFileSync('.active_accs', 'utf-8');
    const accs = file.split('\n');
    let result: string[] = [];
    for (const accLine of accs) {
        const [label, addr, withdrawAddr, subacc, pkCipher] = accLine.trim().split(',');
        result.push(addr)
    }
    return result
}

export function needToStop(): boolean {
    return false
    const file = readFileSync('online_config/stopper.txt', 'utf-8');
    const lines = file.split('\n');
    for (const line of lines){
        let [label, status] = line.trim().split('=');
        if (label.trim() === 'stop'){
            return status.trim() !== "0"
        }
    }
    return true
}

export function getAddressInfo(password: string, address: string): AddressInfo {
    const file = readFileSync('.accs', 'utf-8');
    const accs = file.split('\n');
    for (const accLine of accs) {
        const [label, addr, withdrawAddr, subacc, pkCipher] = accLine.trim().split(',');
        if (addr.toLowerCase() === address.toLowerCase()) {
            console.log(`Found account ${label} for address ${addr}`)
            const pk: string = CryptoJS.AES.decrypt(pkCipher, password).toString(CryptoJS.enc.Utf8)
            return new AddressInfo(addr, pk, withdrawAddr === "" ? null : withdrawAddr, subacc === "" ? null : subacc);
        }
    }
    throw new Error("Missing account info")
}

export function getOkxCredentials(password: string): OkxCredentials {
    if (process.env.OKX_API_KEY && process.env.OKX_API_SECRET && process.env.OKX_PASSPHRASE) {
        const passphrase: string = CryptoJS.AES.decrypt(process.env.OKX_PASSPHRASE, password).toString(CryptoJS.enc.Utf8)
        const secret: string = CryptoJS.AES.decrypt(process.env.OKX_API_SECRET, password).toString(CryptoJS.enc.Utf8)
        return new OkxCredentials(process.env.OKX_API_KEY, passphrase, secret)
    }
    throw new Error("Missing OKX credentials")
}

export function getOkxCredentialsForSub(addressInfo : AddressInfo, password: string): OkxCredentials | null {
    if (!addressInfo.subAccName) {
        console.log(`No subacc for ${addressInfo.address}. Is it ok?`)
        return null
    }
    const file = readFileSync('.subs', 'utf-8');
    const credentials = file.split('\n');
    for (const subAccCredentials of credentials) {
        const [subName, apikey, secretCipher, passphraseCipher] = subAccCredentials.trim().split(',');
        if (subName === addressInfo.subAccName) {
            console.log(`Found account ${subName} for address ${addressInfo.address}`)
            const passphrase: string = CryptoJS.AES.decrypt(passphraseCipher, password).toString(CryptoJS.enc.Utf8)
            const secret: string = CryptoJS.AES.decrypt(secretCipher, password).toString(CryptoJS.enc.Utf8)
            return new OkxCredentials(apikey, passphrase, secret)
        }
    }
    throw new Error(`Missing OKX credentials for ${addressInfo.subAccName}.`)
}

const ESTIMATE_GAS_LIMIT = BigInt(500_000) // берем сразу много, чтобы точно на любом чейне сработало. Нужно только для эстимейта, тк если эстимейтить с фул балансом, то падает тк не хватает средств на газ
export async function getTxDataForAllBalanceTransfer(
    wallet: WalletI, toAddress: string, asset: Asset, fromChain: Chain, extraGasLimit: number, defaultGasPrice: bigint
): Promise<[bigint, TxInteraction]> {
    let provider: UnionProvider
    if (fromChain.title === Blockchains.ZkSync) {
        provider = new zk.Provider(fromChain.nodeUrl)
    } else {
        provider = new ethers.JsonRpcProvider(fromChain.nodeUrl, fromChain.chainId)
    }
    const balanceOr: bigint | BigNumber = await provider.getBalance(wallet.getAddress())
    let balance: bigint
    if (balanceOr instanceof BigNumber) {
        balance = balanceOr.toBigInt()
    } else {
        balance = balanceOr
    }


    globalLogger
        .connect(wallet.getAddress())
        .info(`Amount specified is -1. Fetched balance: ${ethers.formatEther(balance)}`)

    const feeData = await getFeeData(provider, fromChain)

    let txTransferToWithdrawAddress = getTxForTransfer(asset, toAddress, balance - (ESTIMATE_GAS_LIMIT * (feeData.gasPrice ?? defaultGasPrice)))
    const gasLimit = getRandomNearInt(extraGasLimit) + (await getGasLimit(provider, fromChain, wallet.getAddress(), txTransferToWithdrawAddress))
    let l1Cost: bigint = BigInt(0)
    if (fromChain.title === Blockchains.Optimism) {
        l1Cost = await getL1Cost(provider, fromChain, wallet.getAddress(), txTransferToWithdrawAddress)
    }
    const amount = balance - l1Cost - BigInt(gasLimit) * (feeData.maxFeePerGas ?? defaultGasPrice)

    txTransferToWithdrawAddress = getTxForTransfer(asset, toAddress, amount)
    txTransferToWithdrawAddress.feeData = feeData
    return [amount, txTransferToWithdrawAddress]
}

export function bigMax(a: bigint, b: bigint): bigint {
    return a > b ? a : b
}