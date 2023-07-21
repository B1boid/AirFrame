import {Chain} from "../config/chains";
import {WalletI} from "./wallet";
import {Randomness} from "./actions";
import {getActivitiesGenerator} from "./activity_generators";


export abstract class BlockchainModule {
    chain: Chain
    activities: Activity[] // all available activities for this module

    constructor(chain: Chain, activities: Activity[]) {
        this.chain = chain;
        this.activities = activities;
    }

    async doActivities(wallet: WalletI, activities: Activity[], randomOrder: Randomness): Promise<void> {
        const txsGen = getActivitiesGenerator(activities, randomOrder)
        for (const activityTx of txsGen) {
            const interactions = activityTx.tx(wallet)
            for (const tx of interactions) {
                await wallet
                    .sendTransaction(tx)
                    .catch(reason => {
                            console.log(`[ERROR] Activity ${activityTx.activityName}. Tx: ${tx}. Reason: ${reason}`)
                            console.log("Retrying tx...")
                            wallet
                                .sendTransaction(tx)
                                .catch(failedRetryReason =>
                                    console.log(`[ERROR RETRYING] Reason: ${failedRetryReason}. Shutdown.`)
                                )
                        }

                    )

            }
        }

        console.log(`All done.`)
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
