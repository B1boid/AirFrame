import {moduleZkSync} from "./zksync/zksync";
import {BlockchainModule} from "../classes/module";
import {modulePolygon} from "./polygon/polygon";
import {EnumDictionary} from "../utils/utils";


export enum PolygonActivity {
    Project1 = "polygonProject1"
}

export enum ZkSyncActivity {
    Project1 = "zksyncProject1",
    Project2 = "zksyncProject2"
}

export type ActivityTag = PolygonActivity | ZkSyncActivity

export enum Blockchains {
    ZkSync = "ZkSync",
    Polygon = "Polygon"
}

export const blockchainModules: EnumDictionary<Blockchains, BlockchainModule> = {
    [Blockchains.ZkSync]: moduleZkSync,
    [Blockchains.Polygon]: modulePolygon,
}
