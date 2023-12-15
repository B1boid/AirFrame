import {Chain, lineaChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {
    lineaSwapEthToWst

} from "./activities";


class LineaModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

}


export const moduleLinea: LineaModule = new LineaModule(
    lineaChain,
    [
        lineaSwapEthToWst
    ]
)
