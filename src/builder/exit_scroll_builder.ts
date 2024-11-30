import {AnyActions, ConnectionAction, ModuleActions, Randomness, WalletActions} from "../classes/actions";
import {getAccBalance, getTokenBalance} from "./features";
import {Blockchains, Destination, scrollChain, zkSyncChain} from "../config/chains";
import {Asset} from "../config/tokens";
import {Connections} from "../module_connections/connection_modules";
import {getActiveAddressesWithLabels, getRandomElement, getRandomInt, shuffleArray} from "../utils/utils";
import {ScrollActivity} from "../module_blockchains/blockchain_modules";
import {globalLogger} from "../utils/logger";
import {ethers} from "ethers-new";


interface ExtendedFeatures {
    walletAddress: string,
    label: string,
    scrollBalance: bigint,
    aaveBalance: bigint,
    layerbankBalance: bigint
}
const MIN_BALANCE_FOR_EXIT = ethers.parseEther("0.0025")
const MIN_BALANCE_FOR_EXIT_LENDING = ethers.parseEther("0.001")

const AAVE_WETH = "0xf301805bE1Df81102C957f6d4Ce29d2B8c056B2a"
const LAYERBANK_WETH = "0x274C3795dadfEbf562932992bF241ae087e0a98C"

export async function buildExitScrollToBase(): Promise<WalletActions[]> {
    let activeAddresses: string[][] = getActiveAddressesWithLabels()
    let accountInfos: ExtendedFeatures[] = []
    for (let [address, label] of activeAddresses){
        let features = await getAccountInfo(address, label)
        if (features === null) {
            throw new Error(`Failed to get features for ${address}`)
        }
        accountInfos.push(features)
    }
    shuffleArray(accountInfos)
    let res: WalletActions[] = []
    for (let accInfo of accountInfos) {
        res.push(generateActions(accInfo))
        console.log(res[res.length - 1])
    }
    printStats(accountInfos)

    return res
}


async function getAccountInfo(address: string, label: string, retries: number = 1): Promise<ExtendedFeatures | null> {
    if (retries < 0) return null
    try {
        let scrollBal = await getAccBalance(address, scrollChain)
        let aaveBal = await getTokenBalance(address, scrollChain, AAVE_WETH)
        let layerbankBal = await getTokenBalance(address, scrollChain, LAYERBANK_WETH)
        if (scrollBal === null || aaveBal === null || layerbankBal === null) {
            return null
        }
        return {
            walletAddress: address,
            label: label,
            scrollBalance: scrollBal,
            aaveBalance: aaveBal,
            layerbankBalance: layerbankBal
        }
    } catch (e) {
        return await getAccountInfo(address, label, retries - 1)
    }
}

function printStats(accs: ExtendedFeatures[]){
    let accsWithBalance = 0
    for (let accInfo of accs) {
        if (accInfo.scrollBalance + accInfo.aaveBalance + accInfo.layerbankBalance >= MIN_BALANCE_FOR_EXIT){
            accsWithBalance += 1
        }
    }
    globalLogger.done(`\nTotal accounts: ${accs.length}\nAccounts with scroll-balance: ${accsWithBalance}`)
}

function generateActions(accInfo: ExtendedFeatures): WalletActions {
    let actions: AnyActions[] = []

    if (accInfo.scrollBalance + accInfo.aaveBalance + accInfo.layerbankBalance >= MIN_BALANCE_FOR_EXIT){
        generateScroll(accInfo, actions)
        const BRIDGE_SCROLL_TO_BASE: ConnectionAction = {
            from: Destination.Scroll,
            to: Destination.Base,
            asset: Asset.ETH,
            amount: -1,
            connectionName: (getRandomInt(1, 100) < 33 ? Connections.Orbiter : Connections.Universal)
        }
        actions.push(BRIDGE_SCROLL_TO_BASE)
    }

    return {
        address: accInfo.walletAddress,
        actions: actions,
        featuresLine: `${accInfo.label} scrollBalance: ${ethers.formatEther(accInfo.scrollBalance)}, aaveBalance: ${ethers.formatEther(accInfo.aaveBalance)}  layerBalance: ${ethers.formatEther(accInfo.layerbankBalance)}`
    }
}

function generateScroll(accInfo: ExtendedFeatures, actions: AnyActions[]): void {
    let scroll_activities: ScrollActivity[] = []
    if (accInfo.aaveBalance >= MIN_BALANCE_FOR_EXIT_LENDING){
        scroll_activities.push(ScrollActivity.scrollAaveWithdraw)
    }
    if (accInfo.layerbankBalance >= MIN_BALANCE_FOR_EXIT_LENDING){
        scroll_activities.push(ScrollActivity.scrollLayerbankWithdraw)
    }

    const SCROLL_ACTIONS: ModuleActions = {
        chainName: Blockchains.Scroll,
        randomOrder: Randomness.Full,
        activityNames: scroll_activities
    }
    actions.push(SCROLL_ACTIONS)
}













