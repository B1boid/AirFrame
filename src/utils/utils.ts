import {AddressInfo, OkxCredentials} from "../classes/info";
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import CryptoJS from "crypto-js/core";
import {ethers} from "ethers-new";
import {globalLogger} from "./logger";
import {getFeeData, getGasLimit} from "./gas";
import {getTxForTransfer} from "../module_connections/utils";
import {WalletI} from "../classes/wallet";
import {Chain} from "../config/chains";
import {Asset} from "../config/tokens";
import {TxInteraction} from "../classes/module";
dotenv.config();

export type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]: U;
};

export function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}

export function getCurTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomizedPercent(value: bigint, minPercent: number, maxPercent: number): bigint {
    const randomPercent = getRandomInt(minPercent, maxPercent);
    return value * BigInt(randomPercent) / BigInt(100);
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

const ESTIMATE_GAS_LIMIT = 200_000 // берем сразу много, чтобы точно на любом чейне сработало. Нужно только для эстимейта, тк если эстимейтить с фул балансом, то падает тк не хватает средств на газ
export async function getTxDataForAllBalanceTransfer(wallet: WalletI, toAddress: string, asset: Asset, fromChain: Chain, extraGasLimit: number, defaultGasPrice: bigint): Promise<[number, TxInteraction]> {
    const provider = new ethers.JsonRpcProvider(fromChain.nodeUrl)
    const balance = Number(await provider.getBalance(wallet.getAddress()))

    globalLogger
        .connect(wallet.getAddress())
        .info(`Amount specified is -1. Fetched balance: ${ethers.formatEther(BigInt(balance))}`)

    const feeData = await getFeeData(provider, fromChain)

    let txTransferToWithdrawAddress = getTxForTransfer(asset, toAddress, balance - (ESTIMATE_GAS_LIMIT * Number(feeData.gasPrice ?? defaultGasPrice)))
    const gasLimit = extraGasLimit + (await getGasLimit(provider, wallet.getAddress(), txTransferToWithdrawAddress))
    const amount = balance - gasLimit * Number(feeData.maxFeePerGas ?? defaultGasPrice)

    txTransferToWithdrawAddress = getTxForTransfer(asset, toAddress, amount)
    txTransferToWithdrawAddress.feeData = feeData
    return [amount, txTransferToWithdrawAddress]
}