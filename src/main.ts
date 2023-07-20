import {WALLETS_ACTIONS} from "./task";
import {allModules} from "./modules/modules";
import {Wallet, WalletI} from "./classes/wallet";


async function doTask(address: string) {
    let privateKey = "0x" // getPrivateKey(address)
    let wallet: WalletI = new Wallet(privateKey)
    for (let action of WALLETS_ACTIONS[address].actions) {
        if ("connectionName" in action) {
            console.log("Connection:", action)
        } else {
            console.log("Module:", action)
            let blockchainModule = allModules[action.chainName]
            await blockchainModule.doActivities(wallet, action.activityNames, action.randomOrder)
        }
    }
}

function main() {
    for (const wallet in WALLETS_ACTIONS) {
        doTask(wallet)
    }

}


main()