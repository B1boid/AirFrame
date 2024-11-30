import {Chain} from "../config/chains";
import {ethers} from "ethers-new";
import axios from "axios";
import {sleep} from "../utils/utils";
import {globalLogger} from "../utils/logger";
import erc20 from "../abi/erc20.json";


export async function getTxCount(address: string, chain: Chain, retries: number = 1): Promise<number | null> {
    if (retries < 0) return null
    try {
        let provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        return await provider.getTransactionCount(address)
    } catch (e) {
        globalLogger.warn(`Failed to get tx count for ${address} on ${chain.title}, try: ${retries}, error: ${e}`)
        await sleep(1)
        return await getTxCount(address, chain, retries - 1)
    }

}

export async function getAccBalance(address: string, chain: Chain, retries: number = 1): Promise<bigint | null> {
    if (retries < 0) return null
    try {
        let provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        return await provider.getBalance(address)
    } catch (e) {
        globalLogger.warn(`Failed to get tx count for ${address} on ${chain.title}, try: ${retries}, error: ${e}`)
        await sleep(1)
        return await getAccBalance(address, chain, retries - 1)
    }
}

export async function getTokenBalance(address: string, chain: Chain, token: string, retries: number = 1): Promise<bigint | null> {
    if (retries < 0) return null
    try {
        let provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(token, erc20, provider)
        return await tokenContract.balanceOf(address)
    } catch (e) {
        globalLogger.warn(`Failed to get tx count for ${address} on ${chain.title}, try: ${retries}, error: ${e}`)
        await sleep(1)
        return await getAccBalance(address, chain, retries - 1)
    }
}

export async function hasInteractionWithEthContract(user: string, contract: string, retries: number = 1): Promise<boolean | null>{
    if (retries < 0) return null
    try {
        const result = await axios.get(`https://api.etherscan.io/api?module=account`, {
            params: {
                action: "txlist",
                address: user,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 100,
                sort: "asc",
                apikey: process.env.ETHERSCAN_API_KEY
            }
        });
        for (let tx of result.data.result) {
            if (tx.to.toLowerCase() === contract.toLowerCase()) return true
        }
        return false
    } catch (e) {
        globalLogger.warn(`Etherscan API failed, try: ${retries}, error: ${e}`)
        await sleep(1)
        return await hasInteractionWithEthContract(user, contract, retries - 1)
    }

}