import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {Contract, ethers} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import SyncPool from "../../abi/syncPool.json";
import SyncSwapRouter from "../../abi/syncSwapRouter.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {getCurTimestamp, getRandomizedPercent} from "../../utils/utils";
import {defaultAbiCoder} from "ethers/lib/utils";
import {globalLogger} from "../../utils/logger";


let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export async function syncSwapNativeTo(
    wrappedToken: string,
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    balancePercent: number[] = [],
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        let txs = []
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        if (balancePercent.length > 0) {
            tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        }

        const classicPoolFactory: Contract = new Contract(contracts.syncSwapPool, SyncPool, provider);
        const poolAddress: string = await classicPoolFactory.getPool(wrappedToken, token);
        if (poolAddress === ZERO_ADDRESS) {
            return []
        }
        const swapData: string = defaultAbiCoder.encode(
            ["address", "address", "uint8"],
            [wrappedToken, wallet.getAddress(), 1]
        );
        const steps = [{
            pool: poolAddress,
            data: swapData,
            callback: ZERO_ADDRESS,
            callbackData: '0x',
        }];
        const paths = [{
            steps: steps,
            tokenIn: ZERO_ADDRESS,
            amountIn: tokenBalance.toString(),
        }];
        const routerContract: Contract = new Contract(contracts.syncSwapRouter, SyncSwapRouter, provider);

        let data = routerContract.interface.encodeFunctionData("swap", [paths, 0, getCurTimestamp() + 1800])
        txs.push({
            to: contracts.syncSwapRouter,
            data: data,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        let logger = globalLogger.connect(wallet.getAddress())
        logger.warn(`${name} failed: ${e}`)
        return []
    }
}

export async function syncSwap(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    balancePercent: number[] = [],
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            let logger = globalLogger.connect(wallet.getAddress())
            logger.warn(`No balance for ${name}`)
            return []
        }
        if (balancePercent.length > 0) {
            tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        }
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.syncSwapRouter, tokenBalance, tokenContract)

        const classicPoolFactory: Contract = new Contract(
            contracts.syncSwapPool, SyncPool, provider
        );
        const poolAddress: string = await classicPoolFactory.getPool(tokenFrom, tokenTo);
        if (poolAddress === ZERO_ADDRESS) {
            return []
        }
        const swapData: string = defaultAbiCoder.encode(
            ["address", "address", "uint8"],
            [tokenFrom, wallet.getAddress(), 1]
        );
        const steps = [{
            pool: poolAddress,
            data: swapData,
            callback: ZERO_ADDRESS,
            callbackData: '0x',
        }];
        const paths = [{
            steps: steps,
            tokenIn: tokenFrom,
            amountIn: tokenBalance.toString(),
        }];
        const routerContract: Contract = new Contract(contracts.syncSwapRouter, SyncSwapRouter, provider);

        let data = routerContract.interface.encodeFunctionData("swap", [paths, 0, getCurTimestamp() + 1800])

        txs.push({
            to: contracts.syncSwapRouter,
            data: data,
            value: "0",
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        let logger = globalLogger.connect(wallet.getAddress())
        logger.warn(`${name} failed: ${e}`)
        return []
    }
}