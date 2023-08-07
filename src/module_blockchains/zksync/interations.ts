import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {getRandomInt, getRandomizedPercent} from "../../utils/utils";
import {ConsoleLogger} from "../../utils/logger";
import wrapped from "../../abi/wrapped.json";
import zns_1 from "../../abi/zns_1.json";
import zns_2 from "../../abi/zns_2.json";
import {commonSwap, Dexes} from "../../common_blockchain/routers/common";
import {zkSyncChain} from "../../config/chains";
import {zkSyncContracts, zkSyncTokens} from "./constants";
import {ethers} from "ethers-new";
import { generateUsername } from "unique-username-generator";
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
        let logger = new ConsoleLogger(wallet.getAddress())
        logger.warn(`zkSyncWrapUnwrap_wrap failed: ${e}`)
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
        let logger = new ConsoleLogger(wallet.getAddress())
        logger.warn(`zkSyncWrapUnwrap_unwrap failed: ${e}`)
        return []
    }
}

export async function zkSyncSwapCycleNativeToUsdc_swapto(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.ETH, tokens.USDC, [20, 40], [Dexes.OneInch],
        wallet, chain, contracts, "zkSyncSwapCycleNativeToUsdc_swapto")
}

export async function zkSyncSwapCycleNativeToUsdc_swapback(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.USDC, tokens.ETH, [], [Dexes.OneInch],
        wallet, chain, contracts, "zkSyncSwapCycleNativeToUsdc_swapback")
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
}


export async function zkSyncRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.BUSD, tokens.WMATIC, tokens.SIS, tokens.IZI, tokens.ZAT, tokens.DVF, tokens.LUSD, tokens.MAV, tokens.MUTE,
        tokens.RETH, tokens.SPACE, tokens.VC, tokens.ZKDOGE, tokens.WBTC
    ]
    let rndSpenders: string[] = [
        contracts.OneInchRouter, contracts.velocoreRouter, contracts.spaceRouter, contracts.syncSwapRouter,
        contracts.iziRouter, contracts.muteRouter,
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}
