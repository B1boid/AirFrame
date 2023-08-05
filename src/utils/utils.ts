import {AddressInfo, OkxCredentials} from "../classes/info";
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
dotenv.config();

export type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]: U;
};

export function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomizedPercent(value: bigint, minPercent: number, maxPercent: number): bigint {
    let randomPercent = getRandomInt(minPercent, maxPercent);
    return value * BigInt(randomPercent) / BigInt(100);
}

export function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function getRandomElement<T> (list: T[]) {
    return list[Math.floor((Math.random()*list.length))];
}

export function getAddressInfo(address: string): AddressInfo {
    const file = readFileSync('.accs', 'utf-8');
    let accs = file.split('\n');
    for (let accLine of accs) {
        let [addr, pk, withdrawAddr, subacc] = accLine.trim().split(',');
        if (addr.toLowerCase() === address.toLowerCase()) {
            return new AddressInfo(addr, pk, withdrawAddr === "" ? null : withdrawAddr, subacc === "" ? null : subacc);
        }
    }
    throw new Error("Missing account info")
}

export function getOkxCredentials(): OkxCredentials {
    if (process.env.OKX_API_KEY && process.env.OKX_API_SECRET && process.env.OKX_PASSPHRASE) {
        return new OkxCredentials(process.env.OKX_API_KEY, process.env.OKX_PASSPHRASE, process.env.OKX_API_SECRET)
    }
    throw new Error("Missing OKX credentials")
}