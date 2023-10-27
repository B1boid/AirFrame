import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {scrollContracts, scrollTokens} from "./constants";
import {scrollChain} from "../../config/chains";
import {getRandomApprove} from "../../common_blockchain/approvals";

let tokens = scrollTokens
let chain = scrollChain
let contracts = scrollContracts



export async function scrollRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.DAI, tokens.USDT, tokens.WSTETH, tokens.WBTC
    ]
    let rndSpenders: string[] = [
        contracts.kyberSwapRouter
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}