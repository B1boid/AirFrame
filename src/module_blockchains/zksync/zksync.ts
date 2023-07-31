import {Chain, zkSyncChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {zksyncProject1, zksyncProject2} from "./activities";
import {WalletI} from "../../classes/wallet";
import {Randomness} from "../../classes/actions";
import {ActivityTag} from "../blockchain_modules";


class ZkSyncModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

    async doActivities(wallet: WalletI, activities: ActivityTag[], randomOrder: Randomness): Promise<boolean> {
        return super.doActivities(wallet, activities, randomOrder); // TODO: change to custom zksync logic
    }
}


export const moduleZkSync: ZkSyncModule = new ZkSyncModule(
    zkSyncChain,
    [
        zksyncProject1, zksyncProject2
    ]
)