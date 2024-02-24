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

let stopAll = false;
let zkSyncKeepRandomAmount = true;
const MAX_TRIES = 10;

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

export function getMedian(arr: number[]) {
    if (arr.length === 0) {
        return; // 0.
    }
    arr.sort((a, b) => a - b); // 1.
    const midpoint = Math.floor(arr.length / 2); // 2.
    return arr.length % 2 === 1 ?
        arr[midpoint] : // 3.1. If odd length, just take midpoint
        (arr[midpoint - 1] + arr[midpoint]) / 2; // 3.2. If even length, take median of midpoints
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
    for (const [ind, accLine] of accs.entries()) {
        const [label, addr, withdrawAddr, subacc, pkCipher] = accLine.trim().split(',');
        if (addr === undefined){
            if (ind === accs.length - 1){
                break
            }
            throw Error(`Invalid address in .active_accs file: ${accLine}`)
        }
        result.push(addr)
    }
    return result
}

export function getActiveAddressesWithLabels(): string[][] {
    const file = readFileSync('.active_accs', 'utf-8');
    const accs = file.split('\n');
    let result = [];
    for (const [ind, accLine] of accs.entries()) {
        const [label, addr, withdrawAddr, subacc, pkCipher] = accLine.trim().split(',');
        if (addr === undefined){
            if (ind === accs.length - 1){
                break
            }
            throw Error(`Invalid address in .active_accs file: ${accLine}`)
        }
        result.push([addr, label])
    }
    return result
}

export function setStop(status: boolean): void {
    stopAll = status
}

export const needToStop = (): boolean => stopAll;

export function setZkSyncKeepRandomAmount(keep: boolean): void {
    zkSyncKeepRandomAmount = keep;
}

export const getZkSyncKeepRandomAmount = (): boolean => zkSyncKeepRandomAmount;

// 20% lvl1 random 0.005 - 0.006
// 25% lvl2 random 0.01 - 0.011
// 30% lvl3 random 0.015-0.0151
// 25% lvl3 random 0.02-0.021
export function getRandomKeepAmount(): bigint {
    let level = getRandomFloat(0.0, 1.0, 4)

    if (level < 0.2) {
        return ethers.parseEther(`${getRandomFloat(0.005, 0.006, 5)}`)
    } else if (level < 0.45) {
        return ethers.parseEther(`${getRandomFloat(0.01, 0.011, 5)}`)
    } else if (level < 0.75) {
        return ethers.parseEther(`${getRandomFloat(0.015, 0.016, 5)}`)
    } else {
        return ethers.parseEther(`${getRandomFloat(0.02, 0.021, 5)}`)
    }
}

// 20% lvl1 random 0.005 - 0.006
// 25% lvl2 random 0.01 - 0.011
// 30% lvl3 random 0.015-0.0151
// 25% lvl3 random 0.02-0.021
export function getRandomKeepAmountFloat(): number {
    let level = getRandomFloat(0.0, 1.0, 4)

    if (level < 0.2) {
        return getRandomFloat(0.005, 0.006, 5)
    } else if (level < 0.45) {
        return getRandomFloat(0.01, 0.011, 5)
    } else if (level < 0.75) {
        return getRandomFloat(0.015, 0.016, 5)
    } else {
        return getRandomFloat(0.02, 0.021, 5)
    }
}


export function getAddressInfo(password: string, address: string): AddressInfo {
    const file = readFileSync('.accs', 'utf-8');
    const accs = file.split('\n');
    for (const accLine of accs) {
        const [label, addr, withdrawAddr, okxacc, subacc, pkCipher] = accLine.trim().split(',');
        if (addr.toLowerCase() === address.toLowerCase()) {
            console.log(`Found account ${label} for address ${addr}`)
            const pk: string = CryptoJS.AES.decrypt(pkCipher, password).toString(CryptoJS.enc.Utf8)
            return new AddressInfo(addr, pk, withdrawAddr === "" ? null : withdrawAddr, okxacc, subacc === "" ? null : subacc);
        }
    }
    throw new Error("Missing account info")
}

export function getOkxCredentials(addressInfo: AddressInfo, password: string): OkxCredentials | null {
    if (!addressInfo.okxAcc) {
        console.log(`No okx for ${addressInfo.address}. Is it ok?`)
        return null
    }
    const file = readFileSync('.okx', 'utf-8');
    const credentials = file.split('\n');
    for (const subAccCredentials of credentials) {
        const [okxName, apikey, secretCipher, passphraseCipher] = subAccCredentials.trim().split(',');
        if (okxName === addressInfo.okxAcc) {
            console.log(`Found okx-account ${okxName} for address ${addressInfo.address}`)
            const passphrase: string = CryptoJS.AES.decrypt(passphraseCipher, password).toString(CryptoJS.enc.Utf8)
            const secret: string = CryptoJS.AES.decrypt(secretCipher, password).toString(CryptoJS.enc.Utf8)
            return new OkxCredentials(apikey, passphrase, secret, "", "")
        }
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
        const [subName, apikey, secretCipher, passphraseCipher, fakeTxId, fakeWallet] = subAccCredentials.trim().split(',');
        if (subName === addressInfo.subAccName) {
            console.log(`Found account ${subName} for address ${addressInfo.address}`)
            const passphrase: string = CryptoJS.AES.decrypt(passphraseCipher, password).toString(CryptoJS.enc.Utf8)
            const secret: string = CryptoJS.AES.decrypt(secretCipher, password).toString(CryptoJS.enc.Utf8)
            return new OkxCredentials(apikey, passphrase, secret, fakeTxId, fakeWallet)
        }
    }
    throw new Error(`Missing OKX credentials for ${addressInfo.subAccName}.`)
}

export function getOkxCredentialsSubs( password: string): OkxCredentials[]{
    const file = readFileSync('.subs', 'utf-8');
    const credentials = file.trim().split('\n');
    let subs: OkxCredentials[] = []
    for (const subAccCredentials of credentials) {
        if (subAccCredentials.trim().length === 0){
            continue
        }
        const [subName, apikey, secretCipher, passphraseCipher, fakeTxId, fakeWallet] = subAccCredentials.trim().split(',');
        const passphrase: string = CryptoJS.AES.decrypt(passphraseCipher, password).toString(CryptoJS.enc.Utf8)
        const secret: string = CryptoJS.AES.decrypt(secretCipher, password).toString(CryptoJS.enc.Utf8)
        subs.push(new OkxCredentials(apikey, passphrase, secret, fakeTxId, fakeWallet))

    }
    return subs
}

const ESTIMATE_GAS_LIMIT = BigInt(500_000) // берем сразу много, чтобы точно на любом чейне сработало. Нужно только для эстимейта, тк если эстимейтить с фул балансом, то падает тк не хватает средств на газ
export async function getTxDataForAllBalanceTransfer(
    wallet: WalletI, toAddress: string, asset: Asset, fromChain: Chain, extraGasLimit: number, defaultGasPrice: bigint, keepAmount: number
): Promise<[bigint, TxInteraction]> {
    let provider: UnionProvider
    if (fromChain.title === Blockchains.ZkSync) {
        provider = new zk.Provider(fromChain.nodeUrl)
    } else {
        provider = new ethers.JsonRpcProvider(fromChain.nodeUrl, fromChain.chainId)
    }

    const balance = await getChainBalance(wallet, fromChain)

    globalLogger
        .connect(wallet.getAddress(), fromChain)
        .info(`Amount specified is -1. Fetched balance: ${ethers.formatEther(balance)}`)

    const feeData = await getFeeData(provider, fromChain)

    let txTransferToWithdrawAddress = getTxForTransfer(asset, toAddress, balance - (ESTIMATE_GAS_LIMIT * (feeData.gasPrice ?? defaultGasPrice)))
    const gasLimit = getRandomNearInt(extraGasLimit) + (await getGasLimit(provider, fromChain, wallet.getAddress(), txTransferToWithdrawAddress))
    let l1Cost: bigint = BigInt(0)
    if (fromChain.title === Blockchains.Optimism) {
        l1Cost = await getL1Cost(provider, fromChain, wallet.getAddress(), txTransferToWithdrawAddress)
    }
    let amount = balance - l1Cost - BigInt(gasLimit) * (feeData.maxFeePerGas ?? defaultGasPrice)

    if (keepAmount !== 0){
        let _keepAmount = ethers.parseEther(keepAmount.toString())
        _keepAmount = (_keepAmount > amount ? amount * BigInt(20) / BigInt(100) : _keepAmount)
        amount = amount - _keepAmount;
        globalLogger
            .connect(wallet.getAddress(), fromChain)
            .info(`ZkSync keep amount: ${keepAmount.toString()}. To transfer: ${amount.toString()}`)
    }

    txTransferToWithdrawAddress = getTxForTransfer(asset, toAddress, amount)
    txTransferToWithdrawAddress.feeData = feeData
    return [amount, txTransferToWithdrawAddress]
}

export async function getChainBalance(wallet: WalletI, fromChain: Chain): Promise<bigint> {
    let provider: UnionProvider
    if (fromChain.title === Blockchains.ZkSync) {
        provider = new zk.Provider(fromChain.nodeUrl)
    } else {
        provider = new ethers.JsonRpcProvider(fromChain.nodeUrl, fromChain.chainId)
    }

    const balanceOr: bigint | BigNumber | null = await retry(async () => {
        try {
            return await provider.getBalance(wallet.getAddress())
        } catch {
            await sleep(5 * 60)
            return null
        }
    }, MAX_TRIES)

    if (balanceOr === null) {
        throw new Error("Failed to fetch balance for all transfer.")
    }

    let balance: bigint
    if (balanceOr instanceof BigNumber) {
        balance = balanceOr.toBigInt()
    } else {
        balance = balanceOr
    }

    return balance
}

export function bigMax(a: bigint, b: bigint): bigint {
    return a > b ? a : b
}


export async function retry<T>(f: (i: number) => T | null, max_tries: number): Promise<T | null> {
    let i = 0
    while (i < max_tries) {
        const res = await f(i + 1)

        if (res !== null) {
            return res
        }

        i++
    }

    return null
}