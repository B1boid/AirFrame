import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {optContracts, optTokens} from "./constants";
import {arbitrumChain, optimismChain, polygonChain, zkSyncChain} from "../../config/chains";
import {commonSwap, Dexes} from "../../common_blockchain/routers/common";
import {checkAndGetApprovalsInteraction, getRandomApprove} from "../../common_blockchain/approvals";
import {ethers, MaxUint256} from "ethers-new";
import aave from "../../abi/aave.json";
import erc20 from "../../abi/erc20.json";
import {globalLogger} from "../../utils/logger";
import {getRandomElement, getRandomFloat, getRandomizedPercent} from "../../utils/utils";
import {commonRefuel, Refuels} from "../../common_blockchain/refuel";
import allAbi from "../../abi/all.json";

let tokens = optTokens
let chain = optimismChain
let contracts = optContracts


export async function optSwapCycleNativeToUsdc_swapto(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.ETH, tokens.USDC, {balancePercent: [5, 10]}, [Dexes.Odos, Dexes.OneInch],
        wallet, chain, contracts, tokens, "optSwapCycleNativeToUsdc_swapto")
}

export async function optSwapCycleNativeToUsdc_swapback(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.USDC, tokens.ETH, {fullBalance: true}, [Dexes.Odos, Dexes.OneInch],
        wallet, chain, contracts, tokens, "optSwapCycleNativeToUsdc_swapback", true)
}

export async function optRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.OP, tokens.USDT, tokens.WLD, tokens.FRAX, tokens.LINK, tokens.WBTC, tokens.CBETH, tokens.LDO, tokens.RPL
    ]
    let rndSpenders: string[] = [
        contracts.odosRouter, contracts.oneInchRouter, contracts.paraswapRouter
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}

export async function optAaveCycle_deposit(wallet: WalletI): Promise<TxInteraction[]> {
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
            name: "optAaveCycle_deposit"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`optAaveCycle_deposit failed: ${e}`)
        return []
    }
}

export async function optAaveCycle_withdraw(wallet: WalletI): Promise<TxInteraction[]> {
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
            name: "optAaveCycle_withdraw"
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`optAaveCycle_withdraw failed: ${e}`)
        return []
    }
}

export async function optMoveDustGas_move(wallet: WalletI): Promise<TxInteraction[]> {
    let balance = getRandomFloat(0.00003, 0.00008, 5) // dust ready to lose
    let chainIds = [arbitrumChain.chainId, zkSyncChain.chainId, 56]
    return await commonRefuel(
        {fixBalance: balance}, [Refuels.Socket], wallet, chain, getRandomElement(chainIds), contracts,
        "optMoveDustGas_move", false
    )
}

export async function optFakeUniExec_do(wallet: WalletI): Promise<TxInteraction[]> {
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
            name: "optFakeUniExec_do"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`optFakeUniExec_do failed: ${e}`)
        return []
    }
}

export async function optOptimismDelegate_do(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokens.OP, allAbi, provider)
        let data: string = tokenContract.interface.encodeFunctionData("delegate", [wallet.getAddress()])
        return [{
            to: tokens.OP,
            data: data,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "optOptimismDelegate_do"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`optOptimismDelegate_do failed: ${e}`)
        return []
    }
}

export async function optRandomStuff_do(wallet: WalletI): Promise<TxInteraction[]> {
    const choice = getRandomElement(
         ["mint1", "claim1", "sea"]
    )
    try {
        if (choice === "mint1") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0xda2dc5277c6b2237983f928d9242febbbe402232", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("mint", [wallet.getAddress()])
            return [{
                to: "0xda2dc5277c6b2237983f928d9242febbbe402232",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "optRandomStuff_do"
            }]
        }
        if (choice === "claim1"){
            return [{
                to: "0x41C914ee0c7E1A5edCD0295623e6dC557B5aBf3C",
                data: "0xf9f031df00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000",
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "optRandomStuff_do"
            }]
        }
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
                name: "optRandomStuff_do"
            }]
        }
        return []
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`optRandomStuff_do failed: ${e}`)
        return []
    }
}

export async function optGranaryCycle_deposit(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [10, 25]
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let depoContract = new ethers.Contract("0x6e20E155819f0ee08d1291b0b9889b0e011b8224", aave, provider)
        let data: string = depoContract.interface.encodeFunctionData(
            "depositETH", ["0x8FD4aF47E4E63d1D2D45582c3286b4BD9Bb95DfE", wallet.getAddress(), 0])
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: "0x6e20E155819f0ee08d1291b0b9889b0e011b8224",
            data: data,
            value: tokenBalance.toString(),
            stoppable: false,
            confirmations: 1,
            name: "optGranaryCycle_deposit"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`optGranaryCycle_deposit failed: ${e}`)
        return []
    }
}

export async function optGranaryCycle_withdraw(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract("0xfF94cc8E2c4B17e3CC65d7B83c7e8c643030D936", erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())

        let txs: TxInteraction[] = await checkAndGetApprovalsInteraction(wallet.getAddress(), "0x6e20E155819f0ee08d1291b0b9889b0e011b8224", tokenBalance, tokenContract)

        let depoContract = new ethers.Contract("0x6e20E155819f0ee08d1291b0b9889b0e011b8224", aave, provider)
        let data: string = depoContract.interface.encodeFunctionData("withdrawETH", ["0x8FD4aF47E4E63d1D2D45582c3286b4BD9Bb95DfE", MaxUint256, wallet.getAddress()])
        txs.push({
            to: "0x6e20E155819f0ee08d1291b0b9889b0e011b8224",
            data: data,
            value: "0",
            stoppable: true,
            confirmations: 1,
            name: "optGranaryCycle_withdraw"
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`optGranaryCycle_withdraw failed: ${e}`)
        return []
    }
}