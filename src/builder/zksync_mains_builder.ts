import {AnyActions, ModuleActions, Randomness, WalletActions} from "../classes/actions";
import {ScrollActivity, ZkSyncActivity} from "../module_blockchains/blockchain_modules";
import {getRandomElement, getRandomInt} from "../utils/utils";
import {Blockchains} from "../config/chains";
import {scrollSimpleSwap} from "../module_blockchains/scroll/activities";

export async function buildZkSyncMains(activeAddresses: string[]): Promise<WalletActions[]> {
    let res: WalletActions[] = []
    for (let addr of activeAddresses) {
        res.push({
            actions: getRandomInt(0, 100) < 50 ? [generateZkSync(), generateScroll()] : [generateScroll(), generateZkSync()],
            address: addr
        })
    }
    return res
}

function generateScroll(): ModuleActions {
    let activities: ScrollActivity[] = generateScrollActivities(getRandomInt(2, 3))

    return {
        chainName: Blockchains.Scroll,
        randomOrder: Randomness.Full,
        activityNames: activities
    }
}

function generateScrollActivities(activitiesNum: number): ScrollActivity[] {
    let availableActivities: ScrollActivity[] = [
        ScrollActivity.scrollDmail,
        ScrollActivity.scrollRandomStuff,
        ScrollActivity.scrollEmptyRouter,
        ScrollActivity.scrollDummyLendingCycle,
        ScrollActivity.scrollDummySwapCycle,
        ScrollActivity.scrollCreateSafe
    ]

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
                ScrollActivity.scrollSimpleSwap
            ]
            res.push(getRandomElement(swapActivities))
        } else if (curActivity === ScrollActivity.scrollDummyLendingCycle) {
            let lendingActivities: ScrollActivity[] = [
                ScrollActivity.scrollLayerbankCycle, // ScrollActivity.scrollAaveCycle,
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }

        repeatedActivities.push(curActivity)
    }
    return res
}


function generateZkSync(): ModuleActions {
    let activities: ZkSyncActivity[]

    activities = generateZkSyncRandomActivities(getRandomInt(2, 3))
    // if (getRandomInt(0, 100) < 85) { // 85% chance to mint tevaera
    //     activities.push(ZkSyncActivity.zkSyncMintTevaera)
    // }
    // if (getRandomInt(0, 100) < 65) { // 65% chance to mint znsid
    //     activities.push(ZkSyncActivity.zkSyncMintZnsId)
    // }
    // if (getRandomInt(0, 100) < 10) { // 25% chance to enterMarketsZkEra
    //     activities.push(ZkSyncActivity.zkSyncEraLendInit)
    // }
    // if (getRandomInt(0, 100) < 10) { // 25% chance to enterMarketsReactFusion
    //     activities.push(ZkSyncActivity.zkSyncReactFusionInit)
    // }
    // if (getRandomInt(0, 100) < 10) { // 25% chance to mint test tokens
    //     activities.push(ZkSyncActivity.zkSyncSynFuturesTest)
    // }

    return {
        chainName: Blockchains.ZkSync,
        randomOrder: Randomness.Full,
        activityNames: activities
    }

}

function generateZkSyncRandomActivities(activitiesNum: number): ZkSyncActivity[] {
    let availableActivities: ZkSyncActivity[] = [
        ZkSyncActivity.zkSyncDummyRandomSwapCycle, ZkSyncActivity.zkSyncDummyRandomSwapCycle, ZkSyncActivity.zkSyncDummyRandomSwapCycle,
        ZkSyncActivity.zkSyncDummyRandomLending,
        ZkSyncActivity.zkSyncDummyRandomStuff,
        ZkSyncActivity.zkSyncEmptyMulticall,
    ]
    let res: ZkSyncActivity[] = []
    let repeatedActivities: ZkSyncActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ZkSyncActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        if (curActivity === ZkSyncActivity.zkSyncDummyRandomLending) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncReactFusionCycle, ZkSyncActivity.zkSyncEraLendCycle
            ]
            res.push(getRandomElement(lendingActivities))
        } else if (curActivity === ZkSyncActivity.zkSyncDummyRandomSwapCycle) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncSimpleSwap
            ]
            res.push(getRandomElement(lendingActivities))
        } else if (curActivity === ZkSyncActivity.zkSyncDummyRandomStuff) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncDmail, ZkSyncActivity.zkSyncDmail,
                ZkSyncActivity.zkSyncCreateSafe,
                ZkSyncActivity.zkSyncRhinoDeposit, ZkSyncActivity.zkSyncRhinoDeposit
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }
        repeatedActivities.push(curActivity)
    }
    return res
}