import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import maverickRouterAbi from "./../../abi/maverickRouterAbi.json";
import maverickPoolAbi from "./../../abi/maverickPoolAbi.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {globalLogger} from "../../utils/logger";
import {getCurTimestamp, getRandomizedPercent} from "../../utils/utils";
import {ExecBalance, getExecBalance} from "../common_utils";
import {NATIVE_ADDRESS} from "./common";

interface PoolInfo {
    poolAddr: string
    wethLess: boolean
}


const mavPools: {[chainId: string]: {[token: string]: PoolInfo}} = {
    "324": {
        "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4": {
            poolAddr: "0x41C8cf74c27554A8972d3bf3D2BD4a14D8B604AB",
            wethLess: true
        }, // USDC(weth) pool
        "0x703b52F2b28fEbcB60E1372858AF5b18849FE867": {
            poolAddr: "0xc929935c6D780e036aE5C3A0f78e628A10df677B",
            wethLess: false
        }, //WSTETH(weth) ppol
    }
}

export async function maverickSwapNativeTo(
    wrappedToken: string,
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        let txs = []
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let poolContract = new ethers.Contract(contracts.maverickPoolInfo, maverickPoolAbi, provider)
        let routerContract = new ethers.Contract(contracts.maverickRouter, maverickRouterAbi, provider)

        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let poolAddress: string = mavPools[chain.chainId.toString()][token].poolAddr
        let amountsOutMin: bigint = await poolContract.calculateSwap(
            poolAddress, tokenBalance.toString(), mavPools[chain.chainId.toString()][token].wethLess, true, 0
        )
        let minOut: bigint = amountsOutMin * BigInt(998) / BigInt(1000)
        let deadline = getCurTimestamp() + 1000
        const path = wrappedToken + poolAddress.substr(2) + token.substr(2)
        let swapData = routerContract.interface.encodeFunctionData("exactInput",
            [[path, wallet.getAddress(), deadline, tokenBalance.toString(), minOut]]
        )
        let refundData = routerContract.interface.encodeFunctionData("refundETH", [])
        let data = routerContract.interface.encodeFunctionData("multicall", [[swapData, refundData]])
        txs.push({
            to: contracts.maverickRouter,
            data: data,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`${name}-maverick failed: ${e}`)
        return []
    }
}

export async function maverickSwapToNative(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let routerContract = new ethers.Contract(contracts.maverickRouter, maverickRouterAbi, provider)
        let poolContract = new ethers.Contract(contracts.maverickPoolInfo, maverickPoolAbi, provider)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            globalLogger.connect(wallet.getAddress(), chain).warn(`No balance for ${name}`)
            return []
        }
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.maverickRouter, tokenBalance, tokenContract)
        let poolAddress: string = mavPools[chain.chainId.toString()][tokenFrom].poolAddr
        let amountsOutMin: bigint = await poolContract.calculateSwap(
            poolAddress, tokenBalance, !mavPools[chain.chainId.toString()][tokenFrom].wethLess, true, 0
        )
        let minOut: bigint = amountsOutMin * BigInt(998) / BigInt(1000)

        let deadline = getCurTimestamp() + 1000
        const path = tokenFrom + poolAddress.substr(2) + tokenTo.substr(2)
        let swapData = routerContract.interface.encodeFunctionData("exactInput",
            [[path, ethers.ZeroAddress, deadline, tokenBalance.toString(), minOut]]
        )
        let refundData = routerContract.interface.encodeFunctionData("unwrapWETH9", [0, wallet.getAddress()])
        let data = routerContract.interface.encodeFunctionData("multicall", [[swapData, refundData]])
        txs.push({
            to: contracts.maverickRouter,
            data: data,
            value: "0",
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`${name}-maverick failed: ${e}`)
        return []
    }
}