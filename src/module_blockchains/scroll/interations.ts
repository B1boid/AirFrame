import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {scrollContracts, scrollTokens} from "./constants";
import {scrollChain} from "../../config/chains";
import {getRandomApprove} from "../../common_blockchain/approvals";
import {getRandomElement, getRandomFloat, getRandomizedPercent} from "../../utils/utils";
import {ethers} from "ethers-new";
import {globalLogger} from "../../utils/logger";
import allAbi from "../../abi/all.json";
import {commonSwap, Dexes} from "../../common_blockchain/routers/common";
import wrapped from "../../abi/wrapped.json";

let tokens = scrollTokens
let chain = scrollChain
let contracts = scrollContracts



export async function scrollRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.DAI, tokens.USDT, tokens.WSTETH, tokens.WBTC
    ]
    let rndSpenders: string[] = [
        contracts.kyberSwapRouter, contracts.syncSwapRouter, contracts.iziRouter
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}

export async function scrollWrapUnwrap_wrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [20, 40] // from 20% to 40%
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: tokens.WETH,
            data: "0xd0e30db0",
            value: tokenBalance.toString(),
            stoppable: false, // if wrap failed - it's fine, we can continue another activities
            confirmations: 1,
            name: "scrollWrapUnwrap_wrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`scrollWrapUnwrap_wrap failed: ${e}`)
        return []
    }
}

export async function scrollWrapUnwrap_unwrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokens.WETH, wrapped, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        let data: string = tokenContract.interface.encodeFunctionData("withdraw", [tokenBalance])
        return [{
            to: tokens.WETH,
            data: data,
            value: "0",
            stoppable: true, // if unwrap failed - we have remaining wrapped tokens, so we need to stop
            confirmations: 1,
            name: "scrollWrapUnwrap_unwrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`scrollWrapUnwrap_unwrap failed: ${e}`)
        return []
    }
}

export async function scrollEmptyRouter_do(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(contracts.iziRouter, allAbi, provider)
        let data: string = tokenContract.interface.encodeFunctionData("multicall", [[]])
        return [{
            to: contracts.iziRouter,
            data: data,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "scrollEmptyRouter_do"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`scrollEmptyRouter_do failed: ${e}`)
        return []
    }
}

export async function scrollSwapCycleNativeToUsdc_swapto(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.ETH, tokens.USDC, {balancePercent: [1, 3]},
       [Dexes.SyncSwap, Dexes.SpaceFi],
        wallet, chain, contracts, tokens, "scrollSwapCycleNativeToUsdc_swapto")
}

export async function scrollSwapCycleNativeToUsdc_swapback(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.USDC, tokens.ETH, {fullBalance: true},
       [Dexes.SyncSwap, Dexes.SpaceFi],
        wallet, chain, contracts, tokens,"scrollSwapCycleNativeToUsdc_swapback", true)
}



export async function scrollRandomStuff_do(wallet: WalletI): Promise<TxInteraction[]> {
    const choice = getRandomElement(
        []
        //["rhino", "off", "rnd-signin"]
    )
    try {
        if (choice === "rhino") {
            let balance = getRandomFloat(0.000005, 0.000015, 6) // dust ready to lose
            return [{
                to: "0x87627c7e586441eef9ee3c28b66662e897513f33",
                data: "0xdb6b5246",
                value: ethers.parseEther(balance.toString()).toString(),
                stoppable: false,
                confirmations: 1,
                name: "scrollRandomStuff_do"
            }]
        }
        if (choice === "off") {
            let balance = getRandomFloat(0.000005, 0.000015, 6) // dust ready to lose
            let tokenBalance = ethers.parseEther(balance.toString()).toString()
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0x4c0926ff5252a435fd19e10ed15e5a249ba19d79", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("withdrawETH", [tokenBalance, 0])
            return [{
                to: "0x4c0926ff5252a435fd19e10ed15e5a249ba19d79",
                data: data,
                value: tokenBalance,
                stoppable: false,
                confirmations: 1,
                name: "scrollRandomStuff_do"
            }]
        }
        if (choice === "rnd-signin") {
            let date = (new Date().getUTCFullYear()).toString() +
                (new Date().getUTCMonth() + 1).toString()  + (new Date().getUTCDate()).toString()
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0xAC1f9Fadc33cC0799Cf7e3051E5f6b28C98966EE", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("signIn", [date])
            return [{
                to: "0xAC1f9Fadc33cC0799Cf7e3051E5f6b28C98966EE",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "scrollRandomStuff_do"
            }]
        }
        return []
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`scrollRandomStuff_do failed: ${e}`)
        return []
    }
}

export async function scrollDmail_send(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let dmailContract = new ethers.Contract(contracts.dmail, allAbi, provider)
        const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const to: string = genRanHex(64)
        const path: string = genRanHex(64)
        let data: string = dmailContract.interface.encodeFunctionData(
            "send_mail", [to, path]
        )
        return [{
            to: contracts.dmail,
            data: data,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "scrollDmail_send"
        }]
    } catch (e){
        globalLogger.connect(wallet.getAddress(), chain).warn(`scrollDmail_send failed: ${e}`)
        return []
    }
}

export async function scrollDeployAndInteract_deploy(wallet: WalletI): Promise<TxInteraction[]>{
    return []
}

export async function scrollDeployAndInteract_interact(wallet: WalletI): Promise<TxInteraction[]>{
    return []
}