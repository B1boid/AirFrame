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

        let txs: TxInteraction[] = await checkAndGetApprovalsInteraction(contracts.aaveWrapped, contracts.aaveDepo, tokenBalance, tokenContract)

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

export async function optRandomMint_mint(wallet: WalletI): Promise<TxInteraction[]> {
    let nft = getRandomElement([
        {to: contracts.nftMintHolo, value: "63646133376673", data: "0xefef39a10000000000000000000000000000000000000000000000000000000000000001"},
    ])
    return [{
        ...nft,
        stoppable: false,
        confirmations: 1,
        name: "mintNft"
    }]
}