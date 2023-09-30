import {arbitrumChain, Chain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    arbAaveCycle,
    arbArbitrumDelegate,
    arbFakeUniExec, arbFriendsTech, arbMoveDustGas, arbRandomApprove,
    arbRandomStuff,
    arbSwapCycleNativeToUsdc
} from "./activities";


class ArbitrumModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleArbitrum: ArbitrumModule = new ArbitrumModule(
    arbitrumChain,
    [
        arbSwapCycleNativeToUsdc, arbArbitrumDelegate, arbAaveCycle, arbFakeUniExec, arbRandomStuff, arbRandomApprove,
        arbMoveDustGas, arbFriendsTech
    ]
)
