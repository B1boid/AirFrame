import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import mute from "./../../abi/mute.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {ConsoleLogger} from "../../utils/logger";
import {getCurTimestamp, getRandomizedPercent} from "../../utils/utils";



export async function muteSwapNativeTo(
    wrappedToken: string,
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    balancePercent: number[] = [],
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        let txs = []
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let routerContract = new ethers.Contract(contracts.muteRouter, mute, provider)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        if (balancePercent.length > 0) {
            tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        }
        let amountsOutMin: bigint[] = await routerContract.getAmountsOut(tokenBalance.toString(), [wrappedToken, token], [ true, false ])
        let minOut: bigint = amountsOutMin[1] * BigInt(998) / BigInt(1000)
        let data = routerContract.interface.encodeFunctionData("swapExactETHForTokensSupportingFeeOnTransferTokens",
            [minOut, [wrappedToken, token], wallet.getAddress(), getCurTimestamp() + 1200,  [ true, false ]])
        txs.push({
            to: contracts.muteRouter,
            data: data,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        let logger = new ConsoleLogger(wallet.getAddress())
        logger.warn(`${name} failed: ${e}`)
        return []
    }
}

export async function muteSwap(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    balancePercent: number[] = [],
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let routerContract = new ethers.Contract(contracts.muteRouter, mute, provider)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            let logger = new ConsoleLogger(wallet.getAddress())
            logger.warn(`No balance for ${name}`)
            return []
        }
        if (balancePercent.length > 0) {
            tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        }
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.muteRouter, tokenBalance, tokenContract)
        let amountsOutMin: bigint[] = await routerContract.getAmountsOut(tokenBalance.toString(), [tokenFrom, tokenTo], [ true, false ])
        let minOut: bigint = amountsOutMin[1] * BigInt(998) / BigInt(1000)
        let data = routerContract.interface.encodeFunctionData("swapExactTokensForETHSupportingFeeOnTransferTokens",
            [tokenBalance.toString(), minOut, [tokenFrom, tokenTo], wallet.getAddress(), getCurTimestamp() + 1200,  [ true, false ]])
        txs.push({
            to: contracts.muteRouter,
            data: data,
            value: "0",
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        let logger = new ConsoleLogger(wallet.getAddress())
        logger.warn(`${name} failed: ${e}`)
        return []
    }
}