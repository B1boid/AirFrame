import {Chain, polygonChain} from "../../config/chains";
import {Activity, BlockchainModule} from "../../classes/module";
import {polygonWrapUnwrap} from "./activities";


class PolygonModule extends BlockchainModule {
    constructor(chain: Chain, activities: Activity[]) {
        super(chain, activities);
    }

    // doActivities from BlockchainModule
}


export const modulePolygon: PolygonModule = new PolygonModule(
    polygonChain,
    [
        polygonWrapUnwrap
    ]
)
