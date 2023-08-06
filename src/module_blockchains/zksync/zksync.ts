import {Chain, zkSyncChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {Randomness} from "../../classes/actions";
import {ActivityTag} from "../blockchain_modules";
import {zkSyncSwapCycleNativeToUsdc, zkSyncWrapUnwrap} from "./activities";


class ZkSyncModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

    async doActivities(wallet: WalletI, activities: ActivityTag[], randomOrder: Randomness): Promise<boolean> {
        return super.doActivities(wallet, activities, randomOrder);
    }
}


export const moduleZkSync: ZkSyncModule = new ZkSyncModule(
    zkSyncChain,
    [
        zkSyncWrapUnwrap, zkSyncSwapCycleNativeToUsdc
    ]
)