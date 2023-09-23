import {Chain, optimismChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    optAaveCycle,
    optFakeUniExec, optGranaryCycle,
    optMoveDustGas, optOptimismDelegate,
    optRandomApprove,
    optRandomStuff,
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
        optSwapCycleNativeToUsdc, optRandomApprove, optAaveCycle, optMoveDustGas, optFakeUniExec, optOptimismDelegate,
        optGranaryCycle, optRandomStuff
    ]
)
