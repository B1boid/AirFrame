import {Chain, optimismChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    optAaveCycle,
    optFakeUniExec,
    optMoveDustGas,
    optRandomApprove,
    optRandomMint,
    optSwapCycleNativeToUsdc
} from "./activities";


class OptimismModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleOptimism: OptimismModule = new OptimismModule(
    optimismChain,
    [
        optSwapCycleNativeToUsdc, optRandomApprove, optAaveCycle, optMoveDustGas, optFakeUniExec, optRandomMint
    ]
)
