import {Chain, optimismChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";


class OptimismModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleOptimism: OptimismModule = new OptimismModule(
    optimismChain,
    [

    ]
)
