import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {lineaContracts, lineaTokens} from "./constants";
import {lineaChain} from "../../config/chains";
import {ethers, parseEther} from "ethers-new";
import iziAbi from "../../abi/iziAbi.json";
import {globalLogger} from "../../utils/logger";
import {getCurTimestamp, getRandomFloat} from "../../utils/utils";


let tokens = lineaTokens
let chain = lineaChain
let contracts = lineaContracts


export async function lineaSwapEthToWst_swap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(contracts.iziRouter, iziAbi, provider)
        let balance = getRandomFloat(0.015, 0.021, 3)
        let outputBalance = balance / 2 //1.15440378588
        const swapData = tokenContract.interface.encodeFunctionData("swapAmount", [
            ['0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f0001f4b5bedd42000b71fdde22d3ee8a79bd49a568fc8f',
                wallet.getAddress(),
                parseEther(balance.toString()).toString(),
                parseEther(outputBalance.toString()).toString(),
                getCurTimestamp() + 10000,
            ]
        ])
        console.log(swapData)
        let data: string = tokenContract.interface.encodeFunctionData("multicall", [[
            swapData,
            "0x12210e8a"
        ]])
        console.log(data)
        return [{
            to: contracts.iziRouter,
            data: data,
            value: "0",
            stoppable: false,
            confirmations: 1,
            name: "lineaSwapEthToWst_swap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), chain).warn(`lineaSwapEthToWst_swap failed: ${e}`)
        return []
    }
}
