import {TxInteraction} from "../classes/module";
import {ethers, MaxUint256} from "ethers";
import {ConsoleLogger} from "../utils/logger";


export async function checkAndGetApprovalsInteraction(
    fromAddress: string,
    spender: string,
    tokenBalance: bigint,
    tokenContract: ethers.Contract
): Promise<TxInteraction[]> {
    let logger = new ConsoleLogger(fromAddress)
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