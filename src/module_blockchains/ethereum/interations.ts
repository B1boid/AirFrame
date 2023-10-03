import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers, parseEther} from "ethers-new";
import {getRandomElement, getRandomFloat, getRandomizedPercent} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import wrapped from "../../abi/wrapped.json";
import zklite from "../../abi/zklite.json";
import allAbi from "../../abi/all.json";
import mintfun from "../../abi/mintfun.json";
import axios from "axios";
import {arbitrumChain, ethereumChain, optimismChain, polygonChain, zkSyncChain} from "../../config/chains";
import {ethContracts, ethTokens} from "./constants";
import {getRandomApprove} from "../../common_blockchain/approvals";
import {commonRefuel, Refuels} from "../../common_blockchain/refuel";

let tokens = ethTokens
let chain = ethereumChain
let contracts = ethContracts

export async function ethWrapUnwrap_wrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [20, 40]
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: tokens.WETH,
            data: "0xd0e30db0",
            value: tokenBalance.toString(),
            stoppable: false,
            confirmations: 1,
            name: "ethWrapUnwrap_wrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`ethWrapUnwrap_wrap failed: ${e}`)
        return []
    }
}

export async function ethWrapUnwrap_unwrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokens.WETH, wrapped, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        let data: string = tokenContract.interface.encodeFunctionData("withdraw", [tokenBalance])
        return [{
            to: tokens.WETH,
            data: data,
            value: "0",
            stoppable: true,
            confirmations: 1,
            name: "ethWrapUnwrap_unwrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`ethWrapUnwrap_unwrap failed: ${e}`)
        return []
    }
}

export async function ethRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.RETH, tokens.WBTC, tokens.SUSHI, tokens.UNI, tokens.AAVE, tokens.CRV, tokens.STG, tokens.STETH,
        tokens.LDO, tokens.WLD, tokens.BAL, tokens.DYDX, tokens.ENS, tokens.SHIB, tokens.LINK, tokens.PEPE,
        tokens.SNX, tokens.COMP, tokens.BLUR, tokens.IMX, tokens.GRT, tokens.LUSD, tokens.SAND, tokens.ILV,
        tokens.CVX, tokens.FXS, tokens.FRAX, tokens.ENJ, tokens.APE
    ]
    let rndSpenders: string[] = [
        contracts.universalRouter, contracts.permit2, contracts.uniOldRouter, contracts.oneInchRouter,
        contracts.lifiRouter, contracts.openOceanRouter, contracts.metamaskRouter
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}

export async function ethRandomMint_mint(wallet: WalletI): Promise<TxInteraction[]> {
    let nft = getRandomElement([
        // {to: contracts.nftMintHolo, value: "63646133376673", data: "0xefef39a10000000000000000000000000000000000000000000000000000000000000001"},

        {to: contracts.nftMintZerion, value: "0", data: "0x1249c58b"},
        {to: contracts.nftMintFun, value: "0", data: ""},
        {to: contracts.nftMintFun, value: "0", data: ""},
    ])
    if (nft.to === contracts.nftMintFun){
        try {
            const result = (await axios.get(
                `https://mint.fun/api/mintfun/fundrop/mint?address=${wallet.getAddress()}&referrer=0x0000000000000000000000000000000000000000`
            )).data;
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract(contracts.nftMintFun, mintfun, provider)
            nft.data = tokenContract.interface.encodeFunctionData("mint", ["0x0000000000000000000000000000000000000000", result.signature])
        } catch (e){
            globalLogger.connect(wallet.getAddress(), chain).warn(`ethRandomMint_mint(MintFun) failed: ${e}`)
            return []
        }
    }
    return [{
        ...nft,
        stoppable: false,
        confirmations: 1,
        name: "mintNft"
    }]
}


export async function ethDepositToZkLite_deposit(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let zkLiteContract = new ethers.Contract(contracts.zkLite, zklite, provider)
        let data: string = zkLiteContract.interface.encodeFunctionData("depositETH", [wallet.getAddress()])
        let balance = getRandomFloat(0.00003, 0.00013, 5) // dust ready to lose
        return [{
            to: contracts.zkLite,
            data: data,
            value: parseEther(balance.toString()).toString(),
            stoppable: false,
            confirmations: 1,
            name: "ethDepositToZkLite_deposit"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`ethDepositToZkLite_deposit failed: ${e}`)
        return []
    }
}

export async function ethDepositToArbOfficial_deposit(wallet: WalletI): Promise<TxInteraction[]> {
    let balance = getRandomFloat(0.00003, 0.00013, 5) // dust ready to lose
    return [{
        to: contracts.arbOffBridge,
        data: "0x439370b1",
        value: parseEther(balance.toString()).toString(),
        stoppable: false,
        confirmations: 1,
        name: "ethDepositToArbOfficial_deposit"
    }]
}

export async function ethBlurCycle_deposit(wallet: WalletI): Promise<TxInteraction[]> {
    let balancePercent = [5, 20]
    const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
    let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
    tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
    return [{
        to: contracts.blurDeposit,
        data: "0xd0e30db0",
        value: tokenBalance.toString(),
        stoppable: false,
        confirmations: 1,
        name: "ethBlurCycle_deposit"
    }]
}

export async function ethBlurCycle_withdraw(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(contracts.blurDeposit, wrapped, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        let data: string = tokenContract.interface.encodeFunctionData("withdraw", [tokenBalance])
        return [{
            to: contracts.blurDeposit,
            data: data,
            value: "0",
            stoppable: true,
            confirmations: 1,
            name: "ethBlurCycle_withdraw"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`ethBlurCycle_withdraw failed: ${e}`)
        return []
    }
}

export async function ethMoveDustGas_move(wallet: WalletI): Promise<TxInteraction[]> {
    let balance = getRandomFloat(0.00003, 0.00013, 5) // dust ready to lose
    let chainIds = [optimismChain.chainId, zkSyncChain.chainId, arbitrumChain.chainId, 56]
    return await commonRefuel(
        {fixBalance: balance}, [Refuels.Socket], wallet, chain, getRandomElement(chainIds), contracts,
        "ethMoveDustGas_move", false
    )
}

export async function ethFakeUniExec_do(wallet: WalletI): Promise<TxInteraction[]> {
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
            name: "ethFakeUniExec_do"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`ethFakeUniExec_do failed: ${e}`)
        return []
    }
}

export async function ethRandomStuff_do(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let type = getRandomElement(
            ["nftx", "ape", "looks", "beans", "lido", "sea", "inch", "blur", "sock", "bend"]
        )
        if (type === "nftx") {
            let datas = [
                "0x0962ef790000000000000000000000000000000000000000000000000000000000000183",
                "0x0962ef790000000000000000000000000000000000000000000000000000000000000022",
                "0x0962ef79000000000000000000000000000000000000000000000000000000000000032f",
                "0x0962ef790000000000000000000000000000000000000000000000000000000000000131",
                "0x0962ef790000000000000000000000000000000000000000000000000000000000000328",
                "0x0962ef790000000000000000000000000000000000000000000000000000000000000155",
                "0x0962ef790000000000000000000000000000000000000000000000000000000000000335"
            ]
            return [{
                to: contracts.claimNFTx,
                data: getRandomElement(datas),
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "ape") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract(contracts.claimApe, allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("claimSelfBAYC", [[]])
            return [{
                to: contracts.claimApe,
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "looks") {
            return [{
                to: "0x000000000060C4Ca14CfC4325359062ace33Fe3D",
                data: "0xe8f9f1dc000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000e655fae4d56241588680f86e3b2377",
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "beans") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0x3Af2A97414d1101E2107a70E7F33955da1346305", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("redeemBeans", [[]])
            return [{
                to: "0x3Af2A97414d1101E2107a70E7F33955da1346305",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "lido") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("claimWithdrawals", [[], []])
            return [{
                to: "0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "sea") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("cancel", [[]])
            return [{
                to: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "inch") {
            return [{
                to: "0x9A0C8Ff858d273f57072D714bca7411D717501D7",
                data: "0x3ccfd60bab000145",
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "blur") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0xb2ecfE4E4D61f8790bbb9DE2D1259B9e2410CEA5", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("cancelTrades", [[]])
            return [{
                to: "0xb2ecfE4E4D61f8790bbb9DE2D1259B9e2410CEA5",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "sock") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0x3a23F943181408EAC424116Af7b7790c94Cb97a5", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("executeRoutes", [[], []])
            return [{
                to: "0x3a23F943181408EAC424116Af7b7790c94Cb97a5",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        if (type === "bend") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0x26FC1f11E612366d3367fc0cbFfF9e819da91C8d", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("claimRewards", [[], 0])
            return [{
                to: "0x26FC1f11E612366d3367fc0cbFfF9e819da91C8d",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "ethRandomStuff_do"
            }]
        }
        return []
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`ethRandomStuff_do failed: ${e}`)
        return []
    }
}
