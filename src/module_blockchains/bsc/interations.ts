import {bscChain} from "../../config/chains";
import {bscContracts, bscTokens} from "./constants";
import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {checkAndGetApprovalsInteraction, getRandomApprove} from "../../common_blockchain/approvals";
import {ethers, MaxUint256} from "ethers-new";
import aave from "../../abi/aave.json";
import {getRandomizedPercent} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import erc20 from "../../abi/erc20.json";


let tokens = bscTokens
let chain = bscChain
let contracts = bscContracts


export async function bscRandomApprove_approve(wallet: WalletI): Promise<TxInteraction[]> {
    let rndTokens: string[] = [
        tokens.XRP, tokens.DOGE, tokens.BUSD, tokens.DAI, tokens.SHIB, tokens.MATIC, tokens.ADA, tokens.TONCOIN
    ]
    let rndSpenders: string[] = [
        contracts.odosRouter, contracts.oneInchRouter, contracts.paraswapRouter, contracts.pancakeRouter
    ]
    return await getRandomApprove(rndTokens, rndSpenders, wallet.getAddress(), chain)
}

export async function bscKinzaCycle_deposit(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [10, 25]
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let depoContract = new ethers.Contract(contracts.kinzaDepo, aave, provider)
        let data: string = depoContract.interface.encodeFunctionData("depositETH", [tokens.WBNB, wallet.getAddress(), 0])
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: contracts.kinzaDepo,
            data: data,
            value: tokenBalance.toString(),
            stoppable: false,
            confirmations: 1,
            name: "bscKinzaCycle_deposit"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`bscKinzaCycle_deposit failed: ${e}`)
        return []
    }
}

export async function bscKinzaCycle_withdraw(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(contracts.bnbKinzaWrapped, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())

        let txs: TxInteraction[] = await checkAndGetApprovalsInteraction(contracts.bnbKinzaWrapped, contracts.kinzaDepo, tokenBalance, tokenContract)

        let depoContract = new ethers.Contract(contracts.kinzaDepo, aave, provider)
        let data: string = depoContract.interface.encodeFunctionData("withdrawETH", [contracts.bnbKinzaWrapped, MaxUint256, wallet.getAddress()])
        txs.push({
            to: contracts.kinzaDepo,
            data: data,
            value: "0",
            stoppable: true,
            confirmations: 1,
            name: "bscKinzaCycle_withdraw"
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`bscKinzaCycle_withdraw failed: ${e}`)
        return []
    }
}

