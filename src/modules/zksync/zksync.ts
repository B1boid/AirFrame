import {Chain, zkSyncChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {zksyncProject1, zksyncProject2} from "./activities";
import {WalletI} from "../../classes/wallet";
import {Randomness} from "../../classes/actions";


class ZksyncModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

    async doActivities(wallet: WalletI, activities: Activity[], randomOrder: Randomness): Promise<void> {
        return super.doActivities(wallet, activities, randomOrder); // TODO: change to custom zksync logic
    }
}


export const moduleZkSync: ZksyncModule = new ZksyncModule(
    zkSyncChain,
    [
        zksyncProject1, zksyncProject2
    ]
)