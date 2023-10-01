import {arbitrumChain, bscChain, optimismChain, zkSyncChain} from "../../config/chains";
import {arbContracts, arbTokens} from "./constants";
import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {checkAndGetApprovalsInteraction, getRandomApprove} from "../../common_blockchain/approvals";
import {ethers, MaxUint256} from "ethers-new";
import aave from "../../abi/aave.json";
import {getRandomElement, getRandomFloat, getRandomizedPercent} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import erc20 from "../../abi/erc20.json";
import friends from "../../abi/friends.json";
import {commonSwap, Dexes} from "../../common_blockchain/routers/common";
import {commonRefuel, Refuels} from "../../common_blockchain/refuel";
import allAbi from "../../abi/all.json";


let tokens = arbTokens
let chain = arbitrumChain
let contracts = arbContracts


export async function arbRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.ARB, tokens.GMX, tokens.RDNT, tokens.DAI, tokens.WBTC, tokens.LINK, tokens.AGEUR, tokens.UNI, tokens.GRT
    ]
    let rndSpenders: string[] = [
        contracts.odosRouter, contracts.oneInchRouter, contracts.paraswapRouter, contracts.lifiRouter
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}


export async function arbSwapCycleNativeToUsdc_swapto(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.ETH, tokens.USDC, {balancePercent: [5, 10]}, [Dexes.Odos, Dexes.OneInch],
        wallet, chain, contracts, tokens, "arbSwapCycleNativeToUsdc_swapto")
}

export async function arbSwapCycleNativeToUsdc_swapback(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.USDC, tokens.ETH, {fullBalance: true}, [Dexes.Odos, Dexes.OneInch],
        wallet, chain, contracts, tokens, "arbSwapCycleNativeToUsdc_swapback", true)
}

export async function arbAaveCycle_deposit(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [10, 25]
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let depoContract = new ethers.Contract(contracts.aaveDepo, aave, provider)
        let data: string = depoContract.interface.encodeFunctionData("depositETH", [contracts.aavePool, wallet.getAddress(), 0])
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: contracts.aaveDepo,
            data: data,
            value: tokenBalance.toString(),
            stoppable: false,
            confirmations: 1,
            name: "arbAaveCycle_deposit"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`arbAaveCycle_deposit failed: ${e}`)
        return []
    }
}

export async function arbAaveCycle_withdraw(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(contracts.aaveWrapped, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())

        let txs: TxInteraction[] = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.aaveDepo, tokenBalance, tokenContract)

        let depoContract = new ethers.Contract(contracts.aaveDepo, aave, provider)
        let data: string = depoContract.interface.encodeFunctionData("withdrawETH", [contracts.aavePool, MaxUint256, wallet.getAddress()])
        txs.push({
            to: contracts.aaveDepo,
            data: data,
            value: "0",
            stoppable: true,
            confirmations: 1,
            name: "arbAaveCycle_withdraw"
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`arbAaveCycle_withdraw failed: ${e}`)
        return []
    }
}

export async function arbMoveDustGas_move(wallet: WalletI): Promise<TxInteraction[]> {
    let balance = getRandomFloat(0.00003, 0.00008, 5) // dust ready to lose
    let chainIds = [arbitrumChain.chainId, optimismChain.chainId, bscChain.chainId, zkSyncChain.chainId]
    return await commonRefuel(
        {fixBalance: balance}, [Refuels.Socket], wallet, chain, getRandomElement(chainIds), contracts,
        "arbMoveDustGas_move", false
    )
}

export async function arbFakeUniExec_do(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(contracts.universalRouter, allAbi, provider)
        let data: string = tokenContract.interface.encodeFunctionData("execute", ["0x", []])
        return [{
            to: contracts.universalRouter,
            data: data,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "arbFakeUniExec_do"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`arbFakeUniExec_do failed: ${e}`)
        return []
    }
}

export async function arbArbitrumDelegate_do(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokens.ARB, allAbi, provider)
        let data: string = tokenContract.interface.encodeFunctionData("delegate", [wallet.getAddress()])
        return [{
            to: tokens.ARB,
            data: data,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "arbArbitrumDelegate_do"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`arbArbitrumDelegate_do failed: ${e}`)
        return []
    }
}

export async function arbRandomStuff_do(wallet: WalletI): Promise<TxInteraction[]> {
    const choice = getRandomElement(
        ["sea"]
    )
    try {
        if (choice === "sea") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("cancel", [[]])
            return [{
                to: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "arbRandomStuff_do"
            }]
        }
        return []
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`arbRandomStuff_do failed: ${e}`)
        return []
    }
}

export async function arbFriendsTech_buy(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(contracts.friendsTech, friends, provider)
        let sharesBalances: bigint = await tokenContract.sharesBalance(wallet.getAddress(), wallet.getAddress())
        if (sharesBalances === BigInt(0)){
            globalLogger.connect(wallet.getAddress(), chain).info(`ArbitrumFriendsTech has balance: ${sharesBalances}`)
            return []
        }
        let data: string = tokenContract.interface.encodeFunctionData("buyShares", [wallet.getAddress(), 1])
        return [{
            to: contracts.friendsTech,
            data: data,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "arbFriendsTech_buy"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`arbFriendsTech_buy failed: ${e}`)
        return []
    }
}


