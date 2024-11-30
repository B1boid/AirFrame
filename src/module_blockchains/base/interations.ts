import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {baseContracts, baseTokens} from "./constants";
import {baseChain} from "../../config/chains";
import {ethers} from "ethers-new";
import {globalLogger} from "../../utils/logger";
import {getRandomizedPercent} from "../../utils/utils";
import wrapped from "../../abi/wrapped.json";


let tokens = baseTokens
let chain = baseChain
let contracts = baseContracts


export async function baseWrapUnwrap_wrap(wallet: WalletI): Promise<TxInteraction[]> {
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
            name: "baseWrapUnwrap_wrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`baseWrapUnwrap_wrap failed: ${e}`)
        return []
    }
}

export async function baseWrapUnwrap_unwrap(wallet: WalletI): Promise<TxInteraction[]> {
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
            name: "baseWrapUnwrap_unwrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`baseWrapUnwrap_unwrap failed: ${e}`)
        return []
    }
}
