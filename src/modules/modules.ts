import {Destination} from "../config/chains";
import {moduleZkSync} from "./zksync/zksync";
import {BlockchainModule} from "../classes/module";
import {modulePolygon} from "./polygon/polygon";

export const allModules: {[id: string]: BlockchainModule} = {
    zkSync: moduleZkSync,
    Polygon: modulePolygon
}