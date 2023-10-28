import {Chain, scrollChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    scrollDeployAndInteract,
    scrollDmail,
    scrollEmptyRouter,
    scrollRandomApprove,
    scrollRandomStuff,
    scrollSwapCycleNativeToUsdc,
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
        scrollDmail, scrollDeployAndInteract
    ]
)
