import {ethers, parseEther} from "ethers-new";
import socket from "../abi/socket.json";
import {getRandomizedPercent, shuffleArray} from "../utils/utils";
import {TxInteraction} from "../classes/module";
import {WalletI} from "../classes/wallet";
import {Chain} from "../config/chains";
import {globalLogger} from "../utils/logger";


export enum Refuels {
    Socket = "socket",
}

export async function commonRefuel(
    balancePercent: number[],
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
                wallet, fromChain, destChainId, contracts, name, balancePercent, stoppable
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
    balancePercent: number[] = [],
    stoppable: boolean = false
): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(fromChain.nodeUrl, fromChain.chainId)
        let tokenContract = new ethers.Contract(contracts.socketGasMover, socket, provider)
        let data: string = tokenContract.interface.encodeFunctionData(
            "depositNativeToken", [destChainId, wallet.getAddress()])

        let nativeBalanceFull: bigint = await provider.getBalance(wallet.getAddress())
        let nativeBalance: string
        if (balancePercent.length > 1) {
            nativeBalance = getRandomizedPercent(nativeBalanceFull, balancePercent[0], balancePercent[1]).toString()
        } else if (balancePercent.length === 1) {
            nativeBalance = parseEther(balancePercent[0].toString()).toString()
        } else {
            globalLogger.connect(wallet.getAddress()).warn("Full balance - not implemented")
            return []
        }
        return [{
            to: contracts.socketGasMover,
            data: data,
            value: nativeBalance,
            stoppable: stoppable,
            confirmations: 1,
            name: name
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress()).warn(`socketRefuel failed ${e}`)
        return []
    }
}