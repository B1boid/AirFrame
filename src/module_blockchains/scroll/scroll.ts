import {Chain, scrollChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    scrollAaveCycle,
    scrollAaveFull,
    scrollAaveWithdraw,
    scrollCreateSafe,
    scrollDeployAndInteract,
    scrollDmail,
    scrollEmptyRouter,
    scrollInteractWithContract,
    scrollLayerbankCycle,
    scrollLayerbankFull,
    scrollLayerbankWithdraw,
    scrollOffMint,
    scrollRandomApprove,
    scrollRandomStuff,
    scrollSimpleSwap,
    scrollSwapCycleNativeToUsdc,
    scrollSwapCycleNativeToWsteth,
    scrollWrapUnwrap
} from "./activities";


class ScrollModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleScroll: ScrollModule = new ScrollModule(
    scrollChain,
    [
        scrollRandomApprove, scrollRandomStuff, scrollEmptyRouter, scrollSwapCycleNativeToUsdc, scrollWrapUnwrap,
        scrollDmail, scrollDeployAndInteract, scrollOffMint, scrollSwapCycleNativeToWsteth, scrollAaveCycle,
        scrollLayerbankCycle, scrollCreateSafe, scrollInteractWithContract, scrollSimpleSwap, scrollAaveFull,
        scrollLayerbankFull, scrollAaveWithdraw, scrollLayerbankWithdraw
    ]
)
