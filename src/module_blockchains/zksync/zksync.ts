import {Chain, zkSyncChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    zkSyncDummyRandomLending,
    zkSyncEraLendCycle,
    zkSyncEraLendInit,
    zkSyncMintTevaera,
    zkSyncMintZnsId, zkSyncParaspaceCycle,
    zkSyncRandomApprove, zkSyncReactFusionCycle, zkSyncReactFusionInit,
    zkSyncSwapCycleNativeToUsdc, zkSyncSynFuturesTest,
    zkSyncWrapUnwrap
} from "./activities";


class ZkSyncModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }
}


export const moduleZkSync: ZkSyncModule = new ZkSyncModule(
    zkSyncChain,
    [
        zkSyncWrapUnwrap, zkSyncSwapCycleNativeToUsdc, zkSyncMintTevaera, zkSyncMintZnsId, zkSyncRandomApprove,
        zkSyncEraLendInit, zkSyncEraLendCycle, zkSyncReactFusionCycle, zkSyncReactFusionInit, zkSyncParaspaceCycle,
        zkSyncSynFuturesTest, zkSyncDummyRandomLending
    ]
)