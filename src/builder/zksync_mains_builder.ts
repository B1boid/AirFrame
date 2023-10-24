import {ModuleActions, Randomness, WalletActions} from "../classes/actions";
import {ZkSyncActivity} from "../module_blockchains/blockchain_modules";
import {getRandomElement, getRandomInt} from "../utils/utils";
import {Blockchains} from "../config/chains";

export async function buildZkSyncMains(activeAddresses: string[]): Promise<WalletActions[]> {
    let res: WalletActions[] = []
    for (let addr of activeAddresses) {
        res.push({
            actions: [generateZkSync()],
            address: addr
        })
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
    // if (getRandomInt(0, 100) < 50) { // 35% chance to enterMarketsZkEra
    //     activities.push(ZkSyncActivity.zkSyncEraLendInit)
    // }
    // if (getRandomInt(0, 100) < 50) { // 35% chance to enterMarketsReactFusion
    //     activities.push(ZkSyncActivity.zkSyncReactFusionInit)
    // }
    // if (getRandomInt(0, 100) < 50) { // 35% chance to mint test tokens
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
        ZkSyncActivity.zkSyncRandomApprove,
        ZkSyncActivity.zkSyncDmail,
        ZkSyncActivity.wrapUnwrap,
        ZkSyncActivity.zkSyncDummyRandomSwapCycle,
        ZkSyncActivity.zkSyncDummyRandomLending
    ]
    let res: ZkSyncActivity[] = []
    let repeatedActivities: ZkSyncActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ZkSyncActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (curActivity === ZkSyncActivity.zkSyncRandomApprove && res.filter(x => x === curActivity).length < 2){
                break
            }
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        if (curActivity === ZkSyncActivity.zkSyncDummyRandomLending) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncParaspaceCycle, ZkSyncActivity.zkSyncEraLendCycle, ZkSyncActivity.zkSyncReactFusionCycle
            ]
            res.push(getRandomElement(lendingActivities))
        } else if (curActivity === ZkSyncActivity.zkSyncDummyRandomSwapCycle) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncTopSwapCycleNativeToUsdc, ZkSyncActivity.zkSyncSwapCycleNativeToUsdc
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }
        repeatedActivities.push(curActivity)
    }
    return res
}