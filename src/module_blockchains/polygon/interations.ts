import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {polygonTokens} from "./constants";
import {ethers} from "ethers";
import wrapped from "./../../abi/wrapped.json";
import {AbstractProvider} from "ethers/lib.esm";
import {polygonChain} from "../../config/chains";
import {getRandomizedPercent} from "../../utils/utils";

let tokens = polygonTokens
let chain = polygonChain


export async function polygonWrapUnwrap_wrap(wallet: WalletI): Promise<TxInteraction[]> {
    let balancePercent = [30, 50] // from 30% to 50%
    let txs = []
    const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
    let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
    tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
    txs.push({
        to: tokens.WMATIC,
        data: "0xd0e30db0",
        value: tokenBalance.toString(),
        stoppable: false, // if wrap failed - it's fine, we can continue another activities
        name: "polygonWrapUnwrap_wrap"
    })
    return txs
}

export async function polygonWrapUnwrap_unwrap(wallet: WalletI): Promise<TxInteraction[]> {
    let txs = []
    const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
    let tokenContract = new ethers.Contract(tokens.WMATIC, wrapped, provider)
    let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
    let data: string = tokenContract.interface.encodeFunctionData("withdraw", [tokenBalance])
    txs.push({
        to: tokens.WMATIC,
        data: data,
        value: "0",
        stoppable: true, // if unwrap failed - we have remaining wrapped tokens, so we need to stop
        name: "polygonWrapUnwrap_unwrap"
    })
    return txs
}