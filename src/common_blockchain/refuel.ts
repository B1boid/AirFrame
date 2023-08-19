import {ethers, parseEther} from "ethers-new";
import socket from "../abi/socket.json";
import {getRandomizedPercent, shuffleArray} from "../utils/utils";
import {TxInteraction} from "../classes/module";
import {WalletI} from "../classes/wallet";
import {Chain} from "../config/chains";
import {globalLogger} from "../utils/logger";
import {ExecBalance, getExecBalance} from "./common_utils";


export enum Refuels {
    Socket = "socket",
}

export async function commonRefuel(
    execBalance: ExecBalance = {fullBalance: true},
    refuels: Refuels[],
    wallet: WalletI,
    fromChain: Chain,
    destChainId: number,
    contracts: { [id: string]: string },
    name: string,
    stoppable: boolean = false
){
    shuffleArray(refuels)
    let res: TxInteraction[] = []
    for (let refuel of refuels) {
        if (refuel === Refuels.Socket) {
            res = await socketRefuel(
                wallet, fromChain, destChainId, contracts, name, execBalance, stoppable
            )
        }
        if (res.length > 0) break
    }
    return res
}

async function socketRefuel(
    wallet: WalletI,
    fromChain: Chain,
    destChainId: number,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false
): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(fromChain.nodeUrl, fromChain.chainId)
        let tokenContract = new ethers.Contract(contracts.socketGasMover, socket, provider)
        let data: string = tokenContract.interface.encodeFunctionData(
            "depositNativeToken", [destChainId, wallet.getAddress()])

        let nativeBalanceFull: bigint = await provider.getBalance(wallet.getAddress())
        let nativeBalance = getExecBalance(execBalance, nativeBalanceFull)
        if (nativeBalance === null) return []
        return [{
            to: contracts.socketGasMover,
            data: data,
            value: nativeBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress()).warn(`socketRefuel failed ${e}`)
        return []
    }
}