import {Chain, polygonChain, zkSyncChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {Randomness} from "../../classes/actions";
import {polygonProject1} from "./activities";


class PolygonModule implements BlockchainModule {
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


export const modulePolygon: PolygonModule = new PolygonModule(
    polygonChain,
    [
        polygonProject1
    ]
)