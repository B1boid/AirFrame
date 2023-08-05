import {Chain, ethereumChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";


class EthereumModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleEthereum: EthereumModule = new EthereumModule(
    ethereumChain,
    [

    ]
)
