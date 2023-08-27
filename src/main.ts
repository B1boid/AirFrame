import {blockchainModules} from "./module_blockchains/blockchain_modules";
import {MyWallet, WalletI} from "./classes/wallet";
import {connectionModules} from "./module_connections/connection_modules";
import {
    getActiveAddresses,
    getAddressInfo,
    getOkxCredentials,
    getOkxCredentialsForSub,
    needToStop, printActions, sleep, sleepWithLimits
} from "./utils/utils";
import {WALLETS_ACTIONS_1} from "./tests/task1";
import {Builder, Strategy} from "./builder/common_builder";
import {WalletActions} from "./classes/actions";
import {RunConfig, TEST_CONFIG, ZKSYNC_BASIC_CONFIG} from "./config/run_config";
import {globalLogger} from "./utils/logger";
import {PromisePool} from "@supercharge/promise-pool";
import {bot} from "./telegram/bot";
import {ethereumChain} from "./config/chains";
let prompt = require('password-prompt')



async function doTask(password: string, passwordOkx: string, walletActions: WalletActions, runConfig: RunConfig): Promise<boolean> {
    const address = walletActions.address
    const addressInfo = getAddressInfo(password, address)
    const wallet: WalletI = new MyWallet(addressInfo,
        getOkxCredentials(passwordOkx),
        getOkxCredentialsForSub(addressInfo, passwordOkx)
    )
    let actionsRes: boolean = true
    let firstSentAmount : number = -1
    let lastSentAmount: number = -1
    console.log("Starting actions for account:", address)
    printActions(walletActions)
    await sleepWithLimits(runConfig.waitInitial)
    for (const action of walletActions.actions) {
        try {
            if ("connectionName" in action) {
                globalLogger.connect(wallet.getAddress(), ethereumChain).done(`Connection: ${JSON.stringify(action)}`)
                const connectionModule = connectionModules[action.connectionName]
                const [status, sent] = await connectionModule.sendAsset(wallet, action.from, action.to, action.asset, action.amount)
                actionsRes = status
                if (firstSentAmount === -1) {
                    firstSentAmount = sent
                } else {
                    lastSentAmount = sent
                }
            } else {
                globalLogger.connect(wallet.getAddress(), ethereumChain).done(`Module: ${JSON.stringify(action)}`)
                const blockchainModule = blockchainModules[action.chainName]
                actionsRes = await blockchainModule.doActivities(wallet, action.activityNames, action.randomOrder, runConfig.waitBetweenModules)
            }
            if (!actionsRes) {
                globalLogger.connect(wallet.getAddress(), ethereumChain).error("Failed to do activities")
                break
            }
        } catch (e) {
            globalLogger.connect(wallet.getAddress(), ethereumChain).error(`Uncaught exception. Terminating address activities. Exception: ${e}`)
            actionsRes = false
            break
        }
        await sleepWithLimits(runConfig.waitBetweenModules)
    }
    if (actionsRes) {
        globalLogger.connect(address, ethereumChain).done(`All done for account! 
        Balance sent for activities: ${firstSentAmount}.
        Last sent via connection module: ${lastSentAmount}.
        Loss (first - last): ${firstSentAmount - lastSentAmount}`)
    } else {
        globalLogger.connect(address, ethereumChain).error("Stop this thread + send emergency-alert")
    }
     return actionsRes
}




export async function main(accsPassword : string | undefined = undefined, okxPassword: string | undefined = undefined){
    // TODO: online config doesn't work - we need to use tg bot for it

    const runConfig: RunConfig = TEST_CONFIG

    const threads: number = runConfig.threads
    const strategy: Strategy = runConfig.strategy

    const password: string = accsPassword ? accsPassword : await prompt('Accs password: ')
    const passwordOkx: string = okxPassword ? okxPassword : await prompt('Okx password: ')

    let actions: WalletActions[]
    if (runConfig.strategy === Strategy.TestMode){
        actions = WALLETS_ACTIONS_1
    } else {
        let activeAddresses: string[] = getActiveAddresses()
        actions = await Builder.build(activeAddresses, strategy)
    }


    const errors: Error[] = []
    const { results} = await PromisePool
        .for(actions)
        .withConcurrency(threads)
        .handleError(async (error, user, pool) => {
            errors.push(error)
            return pool.stop()
        })
        .process(async (action: WalletActions) => {
            const taskRes = await doTask(password, passwordOkx, action, runConfig)
            const forceStop = needToStop()
            if (!taskRes || forceStop) {
                const state = {taskRes, forceStop}
                throw new Error(JSON.stringify(state))
            }
            return [action.address, taskRes, forceStop]
        })

    const resultsCasted = results as [string, boolean, boolean][]
    const errorsCasted: { taskRes: boolean; forceStop: boolean }[] = errors
        .map((x: Error) => JSON.parse(x.message) as {taskRes: boolean, forceStop: boolean})

    if (errorsCasted.filter(x => x.forceStop).length > 0){
        globalLogger.error("Force to stop, so finished pending threads and stopped")
    }

    if (errorsCasted.filter(x => !x.taskRes).length > 0){
        globalLogger.error("One of the threads failed, so finished pending threads and stopped")
    }

    if (resultsCasted.length === actions.length &&
        resultsCasted.filter(x => x[1]).length === actions.length) {
        globalLogger.done("All accounts finished successfully!")
    }

    await bot.stopPolling()
    return
}