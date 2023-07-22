import {WALLETS_ACTIONS} from "./task";
import {blockchainModules} from "./modules/blockchain_modules";
import {Wallet, WalletI} from "./classes/wallet";
import {connectionModules} from "./module_connections/connection_modules";


async function doTask(address: string) {
    let privateKey = "0x" // getPrivateKey(address)
    let wallet: WalletI = new Wallet(privateKey)
    for (let action of WALLETS_ACTIONS[address].actions) {
        let actionsRes;
        if ("connectionName" in action) {
            console.log("Connection:", action)
            let connectionModule = connectionModules[action.connectionName]
            actionsRes = await connectionModule.sendAsset(wallet, action.from, action.to, action.asset, action.amount)
        } else {
            console.log("Module:", action)
            let blockchainModule = blockchainModules[action.chainName]
            actionsRes = await blockchainModule.doActivities(wallet, action.activityNames, action.randomOrder)
        }
        if (!actionsRes) {
            console.log("Failed to do activities")
            break
        }
    }
}

function main() {
    for (const wallet in WALLETS_ACTIONS) {
        doTask(wallet)
    }

}


main()