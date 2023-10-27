import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {scrollContracts, scrollTokens} from "./constants";
import {scrollChain} from "../../config/chains";
import {getRandomApprove} from "../../common_blockchain/approvals";
import {getRandomElement} from "../../utils/utils";
import {ethers} from "ethers-new";
import allAbi from "../../abi/all.json";
import {globalLogger} from "../../utils/logger";

let tokens = scrollTokens
let chain = scrollChain
let contracts = scrollContracts



export async function scrollRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.DAI, tokens.USDT, tokens.WSTETH, tokens.WBTC
    ]
    let rndSpenders: string[] = [
        contracts.kyberSwapRouter, contracts.syncSwapRouter, contracts.iziRouter
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}


export async function scrollRandomStuff_do(wallet: WalletI): Promise<TxInteraction[]> {
    const choice = getRandomElement(
        ["sea"]
    )
    try {
        if (choice === "sea") {
            const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
            let tokenContract = new ethers.Contract("0x1a7b46c660603ebb5fbe3ae51e80ad21df00bdd1", allAbi, provider)
            let data: string = tokenContract.interface.encodeFunctionData("cancel", [[]])
            return [{
                to: "0x1a7b46c660603ebb5fbe3ae51e80ad21df00bdd1",
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "scrollRandomStuff_do"
            }]
        }
        return []
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`scrollRandomStuff_do failed: ${e}`)
        return []
    }
}