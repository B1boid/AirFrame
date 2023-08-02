import {Chain} from "../config/chains";
import {TxResult, WalletI} from "./wallet";
import {Randomness} from "./actions";
import {getActivitiesGenerator} from "../utils/activity_generators";
import {ActivityTag} from "../module_blockchains/blockchain_modules";


export abstract class BlockchainModule {
    chain: Chain
    activities: Activity[] // all available activities for this module

    constructor(chain: Chain, activities: Activity[]) {
        this.chain = chain;
        this.activities = activities;
    }

    async doActivities(wallet: WalletI, activityNames: ActivityTag[], randomOrder: Randomness): Promise<boolean> {
        const activities: Activity[] = this.activities.filter(activity => activityNames.includes(activity.name))
        const txsGen = getActivitiesGenerator(activities, randomOrder)
        let skippedActivities: string[] = []
        for (const activityTx of txsGen) {
            if (skippedActivities.includes(activityTx.activityName)) continue // skip interaction from activity that failed before
            let failed = false
            for (let i = 0; i <= 1; i++) { // extra try with rebuilding tx interaction
                const interactions: TxInteraction[] = await activityTx.tx(wallet)
                for (const [ind, tx] of interactions.entries()) {
                    let txResult: TxResult = await wallet.sendTransaction(tx, this.chain, 1)
                    if (txResult === TxResult.Fail && tx.stoppable) {
                        console.log("Stoppable Transaction failed")
                        failed = true
                        if (i == 1) return false
                    }
                }
                if (!failed) break
            }
            if (failed) {
                skippedActivities.push(activityTx.activityName)
            }
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

export interface Activity {
    name: ActivityTag
    txs: ((wallet: WalletI) => Promise<TxInteraction[]>)[]
}

export interface TxInteraction {
    to: string
    data: string
    value: string
    stoppable: boolean
    name: string
}
