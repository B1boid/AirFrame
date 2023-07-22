import {moduleZkSync} from "./zksync/zksync";
import {BlockchainModule} from "../classes/module";
import {modulePolygon} from "./polygon/polygon";
import {EnumDictionary} from "../utils/utils";


export enum Blockchains {
    zkSync = "zkSync",
    polygon = "polygon"
}

export const blockchainModules: EnumDictionary<Blockchains, BlockchainModule> = {
    [Blockchains.zkSync]: moduleZkSync,
    [Blockchains.polygon]: modulePolygon,
}
