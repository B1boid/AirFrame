import {Chain} from "../config/chains";
import {TxResult, WalletI} from "./wallet";
import {Randomness} from "./actions";
import {getActivitiesGenerator} from "./activity_generators";


export abstract class BlockchainModule {
    chain: Chain
    activities: Activity[] // all available activities for this module

    constructor(chain: Chain, activities: Activity[]) {
        this.chain = chain;
        this.activities = activities;
    }

    async doActivities(wallet: WalletI, activityNames: string[], randomOrder: Randomness): Promise<void> {
        const activities: Activity[] = this.activities.filter(activity => activityNames.includes(activity.name))
        const txsGen = getActivitiesGenerator(activities, randomOrder)
        for (const activityTx of txsGen) {
            const interactions: TxInteraction[] = activityTx.tx(wallet)
            for (const tx of interactions) {
                let txResult: TxResult = await wallet.sendTransaction(tx, 1)
                if (txResult === TxResult.Fail) {
                    console.log("Transaction failed")
                    // i don't want to put it to the end of the queue, because it may cause side effects
                }
            }
        }

        console.log(wallet.getAddress(), this.chain.title, "All activities done")
    }
}

export class ActivityTx {
    activityName: string
    tx: ((wallet: WalletI) => TxInteraction[])

    constructor(activityName: string, tx: ((wallet: WalletI) => TxInteraction[])) {
        this.activityName = activityName
        this.tx = tx
    }
}

export interface Activity {
    name: string
    txs: ((wallet: WalletI) => TxInteraction[])[]
}

export interface TxInteraction {
    to: string
    data: string
    value: string

}
