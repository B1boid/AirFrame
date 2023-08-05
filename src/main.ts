import {blockchainModules} from "./module_blockchains/blockchain_modules";
import {Wallet, WalletI} from "./classes/wallet";
import {connectionModules} from "./module_connections/connection_modules";
import {getAddressInfo, getOkxCredentials} from "./utils/utils";
import {WALLETS_ACTIONS_1} from "./tests/task1";
import {Actions} from "./classes/actions";



async function doTask(address: string, walletActions: Actions) {
    const wallet: WalletI = new Wallet(getAddressInfo(address), getOkxCredentials())
    for (const action of walletActions.actions) {
        let actionsRes;
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
    }
}

function main() {
    for (const wallet in WALLETS_ACTIONS_1) {
        doTask(wallet, WALLETS_ACTIONS_1[wallet])
    }
}


main()