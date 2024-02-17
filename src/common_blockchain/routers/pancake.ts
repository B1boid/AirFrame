import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import pancakeFactoryAbi from "./../../abi/pancakeFactory.json";
import pancakeQuoterAbi from "./../../abi/pancakeQuoter.json";
import pancakePoolAbi from "./../../abi/pancakePool.json";
import pancakeRouterAbi from "./../../abi/pancakeRouter.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {globalLogger} from "../../utils/logger";
import {getCurTimestamp, getRandomizedPercent} from "../../utils/utils";
import {ExecBalance, getExecBalance} from "../common_utils";
import {NATIVE_ADDRESS} from "./common";

interface PoolInfo {
    fee: number
}

const mavPools: {[chainId: string]: {[token: string]: PoolInfo}} = {
    "324": {
        "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4": {
            fee: 500
        }, // USDC(weth) pool
    }
}


export async function pancakeSwapNativeTo(
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
        let routerContract = new ethers.Contract(contracts.pancakeRouter, pancakeRouterAbi, provider)
        let quoterContract = new ethers.Contract(contracts.pancakeQuoter, pancakeQuoterAbi, provider)

        let fee: number = mavPools[chain.chainId.toString()][token].fee
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let amountsOutMin: bigint[] = await quoterContract.quoteExactInputSingle(
            [wrappedToken, token, tokenBalance.toString(), fee, 0]
        )
        let minOut: bigint = amountsOutMin[0] * BigInt(998) / BigInt(1000)

        let swapData = routerContract.interface.encodeFunctionData("exactInputSingle",
            [[wrappedToken, token, fee, wallet.getAddress(), tokenBalance.toString(), minOut, 0]]
        )
        let deadline = getCurTimestamp() + 1000
        let data = routerContract.interface.encodeFunctionData("multicall(uint256,bytes[])",
            [deadline, [swapData]]
        )

        txs.push({
            to: contracts.pancakeRouter,
            data: data,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`${name} failed: ${e}`)
        return []
    }
}

export async function pancakeSwapToNative(
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
        let routerContract = new ethers.Contract(contracts.pancakeRouter, pancakeRouterAbi, provider)
        let quoterContract = new ethers.Contract(contracts.pancakeQuoter, pancakeQuoterAbi, provider)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            globalLogger.connect(wallet.getAddress(), chain).warn(`No balance for ${name}`)
            return []
        }
        let fee: number = mavPools[chain.chainId.toString()][tokenFrom].fee
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.pancakeRouter, tokenBalance, tokenContract)

        let amountsOutMin: bigint[] = await quoterContract.quoteExactInputSingle(
            [tokenFrom, tokenTo, tokenBalance.toString(), fee, 0]
        )
        let minOut: bigint = amountsOutMin[0] * BigInt(998) / BigInt(1000)

        let swapData = routerContract.interface.encodeFunctionData("exactInputSingle",
            [[tokenFrom, tokenTo, fee, "0x0000000000000000000000000000000000000002", tokenBalance.toString(), minOut, 0]]
        )
        let unwrapData = routerContract.interface.encodeFunctionData("unwrapWETH9",
            [minOut, wallet.getAddress()]
        )
        let deadline = getCurTimestamp() + 1000
        let data = routerContract.interface.encodeFunctionData("multicall(uint256,bytes[])",
            [deadline, [swapData, unwrapData]]
        )
        txs.push({
            to: contracts.pancakeRouter,
            data: data,
            value: "0",
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`${name} failed: ${e}`)
        return []
    }
}