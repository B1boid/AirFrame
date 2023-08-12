import {TxInteraction} from "../classes/module";
import {ethers, MaxUint256} from "ethers-new";
import {globalLogger} from "../utils/logger";
import {Chain} from "../config/chains";
import {shuffleArray} from "../utils/utils";
import erc20 from "../abi/erc20.json";


export async function checkAndGetApprovalsInteraction(
    fromAddress: string,
    spender: string,
    tokenBalance: bigint,
    tokenContract: ethers.Contract
): Promise<TxInteraction[]> {
    let logger = globalLogger.connect(fromAddress)
    try {
        let tokenAddress = await tokenContract.getAddress()
        let allowance: bigint = await tokenContract.allowance(fromAddress, spender)
        if (allowance < tokenBalance) {
            logger.info(`Getting approval for token(${tokenAddress}) with spender: ${spender}`)
            let data: string = tokenContract.interface.encodeFunctionData("approve", [spender, MaxUint256])
            return [{
                to: tokenAddress,
                data: data,
                value: "0",
                stoppable: false,
                confirmations: 1,
                name: "approve"
            }]
        } else {
            logger.info(`Already has approval`)
        }
        return []
    } catch (e) {
        logger.warn(`Getting approvals failed: ${e}`)
        return []
    }
}


export async function getRandomApprove(
    tokens: string[],
    spenders: string[],
    fromAddress: string,
    chain: Chain
): Promise<TxInteraction[]> {
    shuffleArray(tokens)
    shuffleArray(spenders)
    for (let token of tokens){
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(token, erc20, provider)
        for (let spender of spenders){
            let res: TxInteraction[] = await checkAndGetApprovalsInteraction(
                fromAddress, spender, BigInt(1), tokenContract
            )
            if (res.length > 0){
                return res
            }
        }
    }
    return []
}