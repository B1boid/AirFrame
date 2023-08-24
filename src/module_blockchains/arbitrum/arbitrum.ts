import {arbitrumChain, Chain, ethereumChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";


class ArbitrumModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleArbitrum: ArbitrumModule = new ArbitrumModule(
    arbitrumChain,
    []
)
