import {Chain, ethereumChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    ethBlurCycle,
    ethDepositToArbOfficial,
    ethDepositToZkLite, ethMoveDustGas,
    ethRandomApprove, ethRandomStuff,
    ethRandomMint,
    ethWrapUnwrap
} from "./activities";


class EthereumModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleEthereum: EthereumModule = new EthereumModule(
    ethereumChain,
    [
        ethWrapUnwrap, ethRandomApprove, ethRandomMint, ethDepositToZkLite, ethDepositToArbOfficial, ethBlurCycle,
        ethMoveDustGas, ethRandomStuff
    ]
)
