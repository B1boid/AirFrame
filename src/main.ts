import {blockchainModules} from "./module_blockchains/blockchain_modules";
import {MyWallet, WalletI} from "./classes/wallet";
import {connectionModules} from "./module_connections/connection_modules";
import {getAddressInfo, getOkxCredentials, getOkxCredentialsForSub} from "./utils/utils";
import {WALLETS_ACTIONS_1} from "./tests/task1";
import {Actions} from "./classes/actions";
let prompt = require('password-prompt')



async function doTask(password: string, passwordOkx: string, address: string, walletActions: Actions) {
    const addressInfo = getAddressInfo(password, address)
    const wallet: WalletI = new MyWallet(addressInfo,
        getOkxCredentials(passwordOkx),
        getOkxCredentialsForSub(addressInfo, passwordOkx)
    )
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

async function main() {
    const password: string = await prompt('Accs password: ')
    const passwordOkx: string = await prompt('Okx password: ')
    for (const wallet in WALLETS_ACTIONS_1) {
        doTask(password, passwordOkx, wallet, WALLETS_ACTIONS_1[wallet])
    }
}


main()