import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {getRandomElement, getRandomFloat, getRandomInt, getRandomizedPercent} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import wrapped from "../../abi/wrapped.json";
import zns_1 from "../../abi/zns_1.json";
import zns_2 from "../../abi/zns_2.json";
import eralend from "../../abi/eralend.json";
import paraspace from "../../abi/paraspace.json";
import {commonSwap, commonTopSwap, Dexes} from "../../common_blockchain/routers/common";
import {zkSyncChain} from "../../config/chains";
import {zkSyncContracts, zkSyncTokens} from "./constants";
import {ethers, MaxUint256, parseEther} from "ethers-new";
import {generateUsername} from "unique-username-generator";
import {getRandomApprove} from "../../common_blockchain/approvals";


let tokens = zkSyncTokens
let chain = zkSyncChain
let contracts = zkSyncContracts


export async function zkSyncWrapUnwrap_wrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [30, 50] // from 30% to 50%
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: tokens.WETH,
            data: "0xd0e30db0",
            value: tokenBalance.toString(),
            stoppable: false, // if wrap failed - it's fine, we can continue another activities
            confirmations: 1,
            name: "zkSyncWrapUnwrap_wrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncWrapUnwrap_wrap failed: ${e}`)
        return []
    }
}

export async function zkSyncWrapUnwrap_unwrap(wallet: WalletI): Promise<TxInteraction[]> {
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
            name: "zkSyncWrapUnwrap_unwrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncWrapUnwrap_unwrap failed: ${e}`)
        return []
    }
}

export async function zkSyncSwapCycleNativeToUsdc_swapto(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.ETH, tokens.USDC, {balancePercent: [5, 10]},
        [Dexes.Odos, Dexes.OneInch, Dexes.SyncSwap, Dexes.Velocore, Dexes.Mute, Dexes.SpaceFi],
        wallet, chain, contracts, tokens, "zkSyncSwapCycleNativeToUsdc_swapto")
}

export async function zkSyncSwapCycleNativeToUsdc_swapback(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.USDC, tokens.ETH, {fullBalance: true},
        [Dexes.Odos, Dexes.OneInch, Dexes.SyncSwap, Dexes.Velocore, Dexes.Mute, Dexes.SpaceFi],
        wallet, chain, contracts, tokens,"zkSyncSwapCycleNativeToUsdc_swapback", true)
}

export async function zkSyncTopSwapCycleNativeToUsdc_swapto(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonTopSwap(tokens.ETH, tokens.USDC, {balancePercent: [20, 40]},
        [Dexes.Odos, Dexes.OneInch],
        wallet, chain, contracts, tokens, "zkSyncTopSwapCycleNativeToUsdc_swapto")
}

export async function zkSyncTopSwapCycleNativeToUsdc_swapback(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonTopSwap(tokens.USDC, tokens.ETH, {fullBalance: true},
        [Dexes.Odos, Dexes.OneInch],
        wallet, chain, contracts, tokens,"zkSyncTopSwapCycleNativeToUsdc_swapback", true)
}

export async function zkSyncMintTevaera_buyid(wallet: WalletI): Promise<TxInteraction[]> {
    return [{
        to: contracts.tevaeraId,
        data: "0xfefe409d",
        value: ethers.parseEther("0.0003").toString(),
        stoppable: false,
        confirmations: 1,
        name: "zkSyncMintTevaera_buyid"
    }]
}

export async function zkSyncMintTevaera_mint(wallet: WalletI): Promise<TxInteraction[]> {
    return [{
        to: contracts.tevaeraNft,
        data: "0x1249c58b",
        value: "0",
        stoppable: false,
        confirmations: 1,
        name: "zkSyncMintTevaera_mint"
    }]
}

export async function zkSyncMintZnsId_mint(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let name: string = generateUsername("", 0, getRandomInt(10, 15))
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let znsContract1 = new ethers.Contract(contracts.znsIdReg, zns_1, provider)
        let data: string = znsContract1.interface.encodeFunctionData(
            "RegisterWithConfig", [name, "2592000", [
                wallet.getAddress(), "0x91b93e6d46ba99bd8170034441e8ca52b4608bcf", wallet.getAddress()
            ]]
        )
        let txs = []
        txs.push({
            to: contracts.znsIdReg,
            data: data,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "zkSyncMintZnsId_mintId"
        })

        let znsContract2 = new ethers.Contract(contracts.znsIdName, zns_2, provider)
        let data2: string = znsContract2.interface.encodeFunctionData(
            "setName", [name + '.zk']
        )
        txs.push({
            to: contracts.znsIdName,
            data: data2,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "zkSyncMintZnsId_setName"
        })

        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncMintZnsId_mint failed: ${e}`)
        return []
    }
}


export async function zkSyncRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.BUSD, tokens.WMATIC, tokens.SIS, tokens.IZI, tokens.ZAT, tokens.DVF, tokens.LUSD, tokens.MAV, tokens.MUTE,
        tokens.RETH, tokens.SPACE, tokens.VC, tokens.ZKDOGE, tokens.WBTC
    ]
    let rndSpenders: string[] = [
        contracts.oneInchRouter, contracts.velocoreRouter, contracts.spaceRouter, contracts.syncSwapRouter,
        contracts.iziRouter, contracts.muteRouter,
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}

export async function zkSyncEraLendInit_enter(wallet: WalletI): Promise<TxInteraction[]> {
    let data: string = "0xc29982380000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000022d8b71599e14f20a49a397b88c1c878c86f5579"
    return [{
        to: contracts.zkEraLendInit,
        data: data,
        value: "0",
        stoppable: false,
        confirmations: 1,
        name: "zkSyncEraLendInit_enter"
    }]
}

export async function zkSyncEraLendCycle_supply(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [5, 20]
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: contracts.zkEraLendEth,
            data: "0x1249c58b",
            value: tokenBalance.toString(),
            stoppable: false,
            confirmations: 1,
            name: "zkSyncEraLendCycle_supply"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncEraLendCycle_supply failed: ${e}`)
        return []
    }
}

export async function zkSyncEraLendCycle_withdraw(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let cTokenContract = new ethers.Contract(contracts.zkEraLendEth, eralend, provider)
        let cTokenBalance: bigint = await cTokenContract.balanceOf(wallet.getAddress())
        let data: string = cTokenContract.interface.encodeFunctionData(
            "redeem", [cTokenBalance.toString()]
        )
        return [{
            to: contracts.zkEraLendEth,
            data: data,
            value: "0",
            stoppable: true,
            confirmations: 1,
            name: "zkSyncEraLendCycle_withdraw"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncEraLendCycle_withdraw failed: ${e}`)
        return []
    }
}

export async function zkSyncReactFusionInit_enter(wallet: WalletI): Promise<TxInteraction[]> {
    let data: string = "0xc299823800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c5db68f30d21cbe0c9eac7be5ea83468d69297e6"
    return [{
        to: contracts.reactFusionInit,
        data: data,
        value: "0",
        stoppable: false,
        confirmations: 1,
        name: "zkSyncReactFusion_enter"
    }]
}

export async function zkSyncReactFusionCycle_supply(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [5, 20]
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: contracts.reactFusionEth,
            data: "0x1249c58b",
            value: tokenBalance.toString(),
            stoppable: false,
            confirmations: 1,
            name: "zkSyncReactFusionCycle_supply"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncReactFusionCycle_supply failed: ${e}`)
        return []
    }
}

export async function zkSyncReactFusionCycle_withdraw(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let cTokenContract = new ethers.Contract(contracts.reactFusionEth, eralend, provider)
        let cTokenBalance: bigint = await cTokenContract.balanceOf(wallet.getAddress())
        let data: string = cTokenContract.interface.encodeFunctionData(
            "redeem", [cTokenBalance.toString()]
        )
        return [{
            to: contracts.reactFusionEth,
            data: data,
            value: "0",
            stoppable: true,
            confirmations: 1,
            name: "zkSyncReactFusionCycle_withdraw"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncReactFusionCycle_withdraw failed: ${e}`)
        return []
    }
}

export async function zkSyncParaspaceCycle_supply(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        // let balancePercent = [5, 20]
        // let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        // tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let depositContract = new ethers.Contract(contracts.paraspace, paraspace, provider)
        let data: string = depositContract.interface.encodeFunctionData(
            "depositETH", [wallet.getAddress(), 0]
        )
        let balance = getRandomFloat(0.00003, 0.00010, 5) // dust ready to lose

        return [{
            to: contracts.paraspace,
            data: data,
            value: parseEther(balance.toString()).toString(),
            stoppable: false,
            confirmations: 1,
            name: "zkSyncParaspaceCycle_supply"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncParaspaceCycle_supply failed: ${e}`)
        return []
    }
}

// depositing dust and skip Withdraw because of timelock
export async function zkSyncParaspaceCycle_withdraw(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let cTokenContract = new ethers.Contract(contracts.paraspaceWithdraw, paraspace, provider)
        let data: string = cTokenContract.interface.encodeFunctionData(
            "withdraw", ["0x5bF39BdE21B95d77fb18F27bBCb07F3648720A2e", MaxUint256, wallet.getAddress()]
        )
        return [{
            to: contracts.paraspaceWithdraw,
            data: data,
            value: "0",
            stoppable: true,
            confirmations: 1,
            name: "zkSyncParaspaceCycle_withdraw"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncParaspaceCycle_withdraw failed: ${e}`)
        return []
    }
}

export async function zkSyncSynFuturesTest_mint(wallet: WalletI): Promise<TxInteraction[]> {
    let testTokens = [contracts.synFuturesMint1, contracts.synFuturesMint2]
    return [{
        to: getRandomElement(testTokens),
        data: "0x1249c58b",
        value: "0",
        stoppable: false,
        confirmations: 1,
        name: "zkSyncSynFuturesTest_mint"
    }]
}

export async function zkSyncRhinoCycle_deposit(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [20, 35]
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: contracts.rhinoDeposit,
            data: "0xdb6b5246",
            value: tokenBalance.toString(),
            stoppable: false,
            confirmations: 1,
            name: "zkSyncRhinoCycle_deposit"
        }]
    } catch (e){
        globalLogger.connect(wallet.getAddress(), chain).warn(`zkSyncRhinoCycle_deposit failed: ${e}`)
        return []
    }
}