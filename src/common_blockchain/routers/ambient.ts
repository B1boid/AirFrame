import {WalletI} from "../../classes/wallet";
import {Chain} from "../../config/chains";
import {ExecBalance, getExecBalance} from "../common_utils";
import {TxInteraction} from "../../classes/module";
import {ethers, formatEther} from "ethers-new";
import {globalLogger} from "../../utils/logger";
import {CrocEnv} from "../../ambient";
import mute from "../../abi/mute.json";
import erc20 from "../../abi/erc20.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {getCurTimestamp} from "../../utils/utils";
import {BigNumber} from "ethers";

export async function ambientSwapNativeTo(
    wrappedToken: string,
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        let txs = []
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getExecBalance(execBalance, tokenBalance)!

        const croc = new CrocEnv(chain.chainId, wallet.getSigner(chain))
        let data = await croc.sellEth(formatEther(tokenBalance).toString()).for(token).encodeSwap({surplus: false})

        txs.push({
            to: contracts.ambientRouter,
            data: data,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`${name} failed: ${e}`)
        return []
    }
}

export async function ambientSwap(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            globalLogger.connect(wallet.getAddress(), chain).warn(`No balance for ${name}`)
            return []
        }
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.ambientRouter, tokenBalance, tokenContract)
        console.log(txs)
        const croc = new CrocEnv(chain.chainId, wallet.getSigner(chain))
        let data = await croc.sell(tokenFrom, BigNumber.from(tokenBalance)).forEth().encodeSwap({surplus: false})

        txs.push({
            to: contracts.ambientRouter,
            data: data,
            value: "0",
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`${name} failed: ${e}`)
        return []
    }
}