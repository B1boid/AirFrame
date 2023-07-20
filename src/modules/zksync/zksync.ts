import {Chain, zkSyncChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {zksyncProject1, zksyncProject2} from "./activities";
import {WalletI} from "../../classes/wallet";
import {Randomness} from "../../classes/actions";


class ZksyncModule implements BlockchainModule {
    chain: Chain;
    activities: Activity[];

    constructor(chain: Chain, activities: Activity[]) {
        this.chain = chain;
        this.activities = activities;
    }

    doActivities(wallet: WalletI, activityNames: string[], randomOrder: Randomness): Promise<void> {
        // randomized order of activityNames
        // pick first Interaction from random Activity
        // execute Interaction and drop it
        // repeat until all Interactions are executed
        return Promise.resolve(undefined);
    }
}


export const moduleZkSync: ZksyncModule = new ZksyncModule(
    zkSyncChain,
    [
        zksyncProject1, zksyncProject2
    ]
)