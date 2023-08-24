import {Chain} from "../config/chains";
import {TxResult, WalletI} from "./wallet";
import {Randomness} from "./actions";
import {getActivitiesGenerator} from "../utils/activity_generators";
import {ActivityTag} from "../module_blockchains/blockchain_modules";
import {FeeData} from "ethers-new";
import {Limits} from "../config/run_config";
import {sleepWithLimits} from "../utils/utils";


export abstract class BlockchainModule {
    chain: Chain
    activities: Activity[] // all available activities for this module
    extraTries: number = 1

    constructor(chain: Chain, activities: Activity[]) {
        this.chain = chain;
        this.activities = activities;
    }

    private getActivitiesTxs(activityNames: ActivityTag[], randomOrder: Randomness): ActivityTx[] {
        const activities: Activity[] = []
        for (const activityName of activityNames) {
            const activity: Activity | undefined = this.activities.find(activity => activity.name === activityName)
            if (activity === undefined) {
                console.log("Unexpected error: Activity not found")
                return []
            }
            activities.push(activity)
        }
        return getActivitiesGenerator(activities, randomOrder)
    }

    async doActivities(wallet: WalletI, activityNames: ActivityTag[], randomOrder: Randomness, waitLimits: Limits): Promise<boolean> {
        let genActivities: ActivityTx[] = this.getActivitiesTxs(activityNames, randomOrder)
        let skippedActivities: string[] = [] // activities with interactions which failed before
        let startedActivities: string[] = [] // activities with at least one successful interaction
        for (const activityTx of genActivities) {
            if (skippedActivities.includes(activityTx.activityName)) continue // skip interaction from activity that failed before
            let failed: boolean = false;
            for (let i = 0; i <= this.extraTries; i++) { // extra try with rebuilding tx interaction
                failed = false
                const interactions: TxInteraction[] = await activityTx.tx(wallet)
                if (interactions.length === 0) {
                    failed = true // empty array means failure while building tx interactions
                    if (i == this.extraTries && startedActivities.includes(activityTx.activityName)){ // prefer to stop - as we don't know if tx is stoppable or not
                        console.log("Tx failed from activity that was already started")
                        return false
                    }
                } else {
                    for (const tx of interactions) {
                        const [txResult,]: [TxResult, string] = await wallet.sendTransaction(tx, this.chain, 1)
                        if (txResult === TxResult.Fail) {
                            if (i == this.extraTries && tx.stoppable) {
                                console.log("Stoppable Transaction failed")
                                return false
                            }
                            failed = true
                        }
                    }
                }
                if (!failed) break
            }
            if (failed) {
                skippedActivities.push(activityTx.activityName)
            } else {
                startedActivities.push(activityTx.activityName)
            }
            await sleepWithLimits(waitLimits)
        }

        console.log(wallet.getAddress(), this.chain.title, "All activities done")
        return true
    }
}

export class ActivityTx {
    activityName: string
    tx: ((wallet: WalletI) => Promise<TxInteraction[]>)

    constructor(activityName: string, tx: ((wallet: WalletI) => Promise<TxInteraction[]>)) {
        this.activityName = activityName
        this.tx = tx
    }
}

export interface WrappedActivity {
    activity: Activity
    id: number
}

export interface Activity {
    name: ActivityTag
    txs: ((wallet: WalletI) => Promise<TxInteraction[]>)[]
}

export interface TxInteraction {
    to: string
    data: string
    value: string
    stoppable: boolean
    confirmations: number
    name: string
    feeData?: FeeData
}