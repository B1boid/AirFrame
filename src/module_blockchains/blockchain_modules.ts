import {moduleZkSync} from "./zksync/zksync";
import {BlockchainModule} from "../classes/module";
import {modulePolygon} from "./polygon/polygon";
import {EnumDictionary} from "../utils/utils";
import {Blockchains} from "../config/chains";
import {moduleEthereum} from "./ethereum/ethereum";


export const enum PolygonActivity {
    wrapUnwrap = "wrapUnwrap",
    polygonSwapCycleNativeToUsdc = "polygonSwapCycleNativeToUsdc",
}

export const enum ZkSyncActivity {
    wrapUnwrap = "wrapUnwrap",
    zkSyncSwapCycleNativeToUsdc = "zkSyncSwapCycleNativeToUsdc",
}

export const enum EthereumActivity {

}

export type ActivityTag = PolygonActivity | ZkSyncActivity | EthereumActivity

export const blockchainModules: EnumDictionary<Blockchains, BlockchainModule> = {
    [Blockchains.ZkSync]: moduleZkSync,
    [Blockchains.Polygon]: modulePolygon,
    [Blockchains.Ethereum]: moduleEthereum
}
