import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import woofi from "./../../abi/woofi.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {globalLogger} from "../../utils/logger";
import {getCurTimestamp, getRandomizedPercent} from "../../utils/utils";
import {ExecBalance, getExecBalance} from "../common_utils";
import {NATIVE_ADDRESS} from "./common";



export async function woofiSwapNativeTo(
    _wrappedToken: string,
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
        let routerContract = new ethers.Contract(contracts.woofiRouter, woofi, provider)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let amountsOutMin: bigint = await routerContract.querySwap(NATIVE_ADDRESS, token, tokenBalance.toString())
        let minOut: bigint = amountsOutMin * BigInt(998) / BigInt(1000)
        let data = routerContract.interface.encodeFunctionData("swap",
            [NATIVE_ADDRESS, token, tokenBalance.toString(), minOut, wallet.getAddress(), wallet.getAddress()])
        txs.push({
            to: contracts.woofiRouter,
            data: data,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`${name}-woofi failed: ${e}`)
        return []
    }
}

export async function woofiSwap(
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
        let routerContract = new ethers.Contract(contracts.woofiRouter, woofi, provider)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            globalLogger.connect(wallet.getAddress(), chain).warn(`No balance for ${name}`)
            return []
        }
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.woofiRouter, tokenBalance, tokenContract)
        let amountsOutMin: bigint = await routerContract.querySwap(tokenFrom, tokenTo, tokenBalance)
        let minOut: bigint = amountsOutMin * BigInt(998) / BigInt(1000)
        let data = routerContract.interface.encodeFunctionData("swap",
            [tokenFrom, tokenTo, tokenBalance.toString(), minOut, wallet.getAddress(), wallet.getAddress()])
        txs.push({
            to: contracts.woofiRouter,
            data: data,
            value: "0",
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`${name}-woofi failed: ${e}`)
        return []
    }
}