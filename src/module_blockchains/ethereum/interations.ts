import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {getRandomizedPercent} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import wrapped from "../../abi/wrapped.json";
import {ethereumChain} from "../../config/chains";
import {ethContracts, ethTokens} from "./constants";
import {getRandomApprove} from "../../common_blockchain/approvals";

let tokens = ethTokens
let chain = ethereumChain
let contracts = ethContracts

export async function ethWrapUnwrap_wrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [30, 50] // from 30% to 50%
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
        globalLogger.connect(wallet.getAddress()).warn(`ethWrapUnwrap_wrap failed: ${e}`)
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
        globalLogger.connect(wallet.getAddress()).warn(`ethWrapUnwrap_unwrap failed: ${e}`)
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