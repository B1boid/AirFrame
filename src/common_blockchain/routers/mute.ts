import axios from "axios";
import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers, formatEther, formatUnits} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import mute from "./../../abi/mute.json";
import {NATIVE_ADDRESS} from "./common";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {ConsoleLogger} from "../../utils/logger";
import {getRandomizedPercent, sleep} from "../../utils/utils";



export async function muteSwapNativeTo(
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
        let amountOutMin = ""
        let data = routerContract.interface.encodeFunctionData("swapExactETHForTokensSupportingFeeOnTransferTokens",
            [amountOutMin, []])
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
        let data = ""
        if (data === null) {
            let logger = new ConsoleLogger(wallet.getAddress())
            let decimals = await tokenContract.decimals()
            logger.warn(`mute quote for ${name} failed, amount: ${formatUnits(tokenBalance.toString(), decimals)}`)
            return []
        }
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