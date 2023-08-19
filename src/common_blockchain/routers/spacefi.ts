import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import spacefi from "./../../abi/spacefi.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {globalLogger} from "../../utils/logger";
import {getCurTimestamp, getRandomizedPercent} from "../../utils/utils";
import {ExecBalance, getExecBalance} from "../common_utils";



export async function spaceFiSwapNativeTo(
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
        let routerContract = new ethers.Contract(contracts.spaceRouter, spacefi, provider)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let amountsOutMin: bigint[] = await routerContract.getAmountsOut(tokenBalance.toString(), [wrappedToken, token])
        let minOut: bigint = amountsOutMin[1] * BigInt(997) / BigInt(1000)
        let data = routerContract.interface.encodeFunctionData("swapExactETHForTokens",
            [minOut, [wrappedToken, token], wallet.getAddress(), getCurTimestamp() + 1200])
        txs.push({
            to: contracts.spaceRouter,
            data: data,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress()).warn(`${name} failed: ${e}`)
        return []
    }
}

export async function spaceFiSwap(
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
        let routerContract = new ethers.Contract(contracts.spaceRouter, spacefi, provider)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            let logger = globalLogger.connect(wallet.getAddress())
            logger.warn(`No balance for ${name}`)
            return []
        }
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.spaceRouter, tokenBalance, tokenContract)
        let amountsOutMin: bigint[] = await routerContract.getAmountsOut(tokenBalance.toString(), [tokenFrom, tokenTo])
        let minOut: bigint = amountsOutMin[1] * BigInt(997) / BigInt(1000)
        let data = routerContract.interface.encodeFunctionData("swapExactTokensForETH",
            [tokenBalance.toString(), minOut, [tokenFrom, tokenTo], wallet.getAddress(), getCurTimestamp() + 1200])
        txs.push({
            to: contracts.spaceRouter,
            data: data,
            value: "0",
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress()).warn(`${name} failed: ${e}`)
        return []
    }
}