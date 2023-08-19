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
import {RunConfig, ZKSYNC_BASIC_CONFIG} from "./config/run_config";
import {globalLogger} from "./utils/logger";
let prompt = require('password-prompt')



async function doTask(password: string, passwordOkx: string, walletActions: WalletActions, runConfig: RunConfig): Promise<boolean> {
    const address = walletActions.address
    const addressInfo = getAddressInfo(password, address)
    const wallet: WalletI = new MyWallet(addressInfo,
        getOkxCredentials(passwordOkx),
        getOkxCredentialsForSub(addressInfo, passwordOkx)
    )
    let actionsRes: boolean = true;
    console.log("Starting actions for account:", address)
    printActions(walletActions)
    await sleepWithLimits(runConfig.waitInitial)
    for (const action of walletActions.actions) {
        try {
            if ("connectionName" in action) {
                console.log("Connection:", action)
                const connectionModule = connectionModules[action.connectionName]
                actionsRes = await connectionModule.sendAsset(wallet, action.from, action.to, action.asset, action.amount)
            } else {
                console.log("Module:", action)
                const blockchainModule = blockchainModules[action.chainName]
                actionsRes = await blockchainModule.doActivities(wallet, action.activityNames, action.randomOrder)
            }
            if (!actionsRes) {
                console.log("Failed to do activities")
                break
            }
        } catch (e) {
            globalLogger.connect(wallet.getAddress()).error(`Uncaught exception. Terminating address activities. Exception: ${e}`)
            actionsRes = false
            break
        }
        await sleepWithLimits(runConfig.waitBetweenModules)
    }
    if (actionsRes) {
        console.log("All done for account:", address)
    } else {
        console.log("Stop this thread + send emergency-alert")
    }
     return actionsRes
}




async function main(){
    // TODO: online config doesn't work - we need to use tg bot for it

    const runConfig: RunConfig = ZKSYNC_BASIC_CONFIG

    const threads: number = runConfig.threads
    const strategy: Strategy = runConfig.strategy

    const password: string = await prompt('Accs password: ')
    const passwordOkx: string = await prompt('Okx password: ')

    let actions: WalletActions[]
    if (runConfig.strategy === Strategy.TestMode){
        actions = WALLETS_ACTIONS_1
    } else {
        let activeAddresses: string[] = getActiveAddresses()
        actions = await Builder.build(activeAddresses, strategy)
    }
    let threadsStatus: boolean[] = Array(threads).fill(true) // true - thread is free, false - thread is busy
    let stopThreads: boolean = false // waiting to finish pending threads and then stop all
    let accountInd: number = 0
    while (true){

        for (let i = 0; i < threads; i++){
            if (accountInd >= actions.length){
                console.log("All accounts finished successfully")
                return
            }
            if (!stopThreads && !needToStop() && threadsStatus[i]){
                threadsStatus[i] = false
                doTask(password, passwordOkx, actions[accountInd], runConfig).then((taskRes) => {
                    if (!taskRes){
                        stopThreads = true
                    }
                    threadsStatus[i] = true
                })
                accountInd += 1
            }
            await sleep(2)
        }

        if (!threadsStatus.includes(false) && stopThreads){
            console.log("One of the threads failed, so finished pending threads and stopped")
            break
        }
        if (!threadsStatus.includes(false) && needToStop()){
            console.log("Force to stop, so finished pending threads and stopped")
            break
        }

        await sleep(10)
    }
}


main()