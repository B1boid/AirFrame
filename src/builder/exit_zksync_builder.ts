import {AnyActions, ConnectionAction, ModuleActions, Randomness, WalletActions} from "../classes/actions";
import {getAccBalance} from "./features";
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
    zkBalance: bigint,
    scrollBalance: bigint
}
const MIN_BALANCE_FOR_EXIT = ethers.parseEther("0.0025")


export async function buildExitZksync(): Promise<WalletActions[]> {
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
        let zkBal = await getAccBalance(address, zkSyncChain)
        let scrollBal = await getAccBalance(address, scrollChain)
        if (zkBal === null || scrollBal === null) {
            return null
        }
        return {
            walletAddress: address,
            label: label,
            zkBalance: zkBal,
            scrollBalance: scrollBal
        }
    } catch (e) {
        return await getAccountInfo(address, label, retries - 1)
    }
}

function printStats(accs: ExtendedFeatures[]){
    let accsWithBalance = 0
    for (let accInfo of accs) {
        if (accInfo.zkBalance >= MIN_BALANCE_FOR_EXIT){
            accsWithBalance += 1
        }
    }
    globalLogger.done(`\nTotal accounts: ${accs.length}\nAccounts with zk-balance: ${accsWithBalance}`)
}

function generateActions(accInfo: ExtendedFeatures): WalletActions {
    let actions: AnyActions[] = []
    if (accInfo.zkBalance >= MIN_BALANCE_FOR_EXIT){
        generateExit(accInfo, actions)
        generateScroll(accInfo, actions)
    } else {
        let min_balance_for_scroll = ethers.parseEther("0.001")
        if (accInfo.scrollBalance >= min_balance_for_scroll){
            generateScroll(accInfo, actions)
        }
    }

    return {
        address: accInfo.walletAddress,
        actions: actions,
        featuresLine: `${accInfo.label} zkBalance: ${ethers.formatEther(accInfo.zkBalance)}, scrollBalance: ${ethers.formatEther(accInfo.scrollBalance)}`
    }
}

function generateExit(accInfo: ExtendedFeatures, actions: AnyActions[]): void {
    const BRIDGE_ZKSYNC_TO_SCROLL: ConnectionAction = {
        from: Destination.ZkSync,
        to: Destination.Scroll,
        asset: Asset.ETH,
        amount: -1,
        connectionName: (getRandomInt(1, 100) < 33 ? Connections.Orbiter : Connections.Universal)
    }
    actions.push(BRIDGE_ZKSYNC_TO_SCROLL)
}

function generateScroll(accInfo: ExtendedFeatures, actions: AnyActions[]): void {
    let isBigBalance = (accInfo.scrollBalance > ethers.parseEther("0.2"));
    let scroll_activities: ScrollActivity[] = generateScrollActivities(getRandomInt(0, 1), isBigBalance)
    // scroll_activities.push(ScrollActivity.scrollAaveFull)
    scroll_activities.push(ScrollActivity.scrollLayerbankFull)

    const SCROLL_ACTIONS: ModuleActions = {
        chainName: Blockchains.Scroll,
        randomOrder: Randomness.Full,
        activityNames: scroll_activities
    }
    actions.push(SCROLL_ACTIONS)
}

function generateScrollActivities(activitiesNum: number, bigBalance: boolean = false): ScrollActivity[] {
    let availableActivities: ScrollActivity[] = [
        // ScrollActivity.scrollDmail,
        ScrollActivity.scrollRandomStuff,
        ScrollActivity.scrollEmptyRouter,
        // ScrollActivity.scrollDummyLendingCycle,
        ScrollActivity.scrollDummySwapCycle,
        // ScrollActivity.scrollCreateSafe
    ]
    if (bigBalance){
        // availableActivities.push(ScrollActivity.scrollDummyLendingCycle)
        // availableActivities.push(ScrollActivity.scrollDummyLendingCycle)
        availableActivities.push(ScrollActivity.scrollDummySwapCycle)
        availableActivities.push(ScrollActivity.scrollDummySwapCycle)
        availableActivities.push(ScrollActivity.scrollDummySwapCycle)
    }

    let res: ScrollActivity[] = []
    let repeatedActivities: ScrollActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ScrollActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        if (curActivity === ScrollActivity.scrollDummySwapCycle) {
            let swapActivities: ScrollActivity[] = [
                ScrollActivity.scrollSwapCycleNativeToWsteth, ScrollActivity.scrollSwapCycleNativeToUsdc
            ]
            res.push(getRandomElement(swapActivities))
        } else if (curActivity === ScrollActivity.scrollDummyLendingCycle) {
            let lendingActivities: ScrollActivity[] = [
                ScrollActivity.scrollLayerbankCycle, ScrollActivity.scrollAaveCycle,
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }

        repeatedActivities.push(curActivity)
    }
    return res
}
