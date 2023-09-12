import {Chain, bscChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {bscKinzaCycle, bscRandomApprove} from "./activities";


class BscModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleBsc: BscModule = new BscModule(
    bscChain,
    [
        bscRandomApprove, bscKinzaCycle
    ]
)
