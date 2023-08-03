import {Actions, ConnectionAction, ModuleActions, Randomness} from "../classes/actions";
import {Blockchains, Destination} from "../config/chains";
import {Connections} from "../module_connections/connection_modules";
import {PolygonActivity} from "../module_blockchains/blockchain_modules";
import {Asset} from "../config/tokens";

////////////////////////////////////////////////////////////////////////
// Later we will get it from UI, now it's hardcoded for testing
////////////////////////////////////////////////////////////////////////

const POLYGON_ACTIONS: ModuleActions = {
    chainName: Blockchains.Polygon,
    randomOrder: Randomness.OnlyActivities,
    activityNames: [PolygonActivity.polygonSwapCycleNativeToUsdc, PolygonActivity.wrapUnwrap, PolygonActivity.wrapUnwrap]
}

const CONNECTION_OKX_TO_POLYGON: ConnectionAction = {
    from: Destination.OKX,
    to: Destination.Polygon,
    asset: Asset.MATIC,
    amount: 2,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_POLYGON_TO_OKX: ConnectionAction = {
    from: Destination.Polygon,
    to: Destination.OKX,
    asset: Asset.MATIC,
    amount: -1,
    connectionName: Connections.ExchangeOKX
}


const ACTIONS_1: Actions = {
    actions: [
        // CONNECTION_OKX_TO_POLYGON,
        POLYGON_ACTIONS,
        // CONNECTION_POLYGON_TO_OKX
    ]
}

export const WALLETS_ACTIONS_1: {[id: string]: Actions} = {
    "0x90eAC2Dda44F0a96C81a34b69C6aF653Db33cf53": ACTIONS_1,
    // "0x..2": ACTIONS_1
}

////////////////////////////////////////////////////////////////////////