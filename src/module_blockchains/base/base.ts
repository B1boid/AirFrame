import {baseChain, Chain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    baseWrapUnwrap
} from "./activities";


class BaseModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleBase: BaseModule = new BaseModule(
    baseChain,
    [
        baseWrapUnwrap
    ]
)
