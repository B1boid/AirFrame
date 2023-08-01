import {Actions, Asset, ConnectionAction, ModuleActions, Randomness} from "./classes/actions";
import {Destination} from "./config/chains";
import {Connections} from "./module_connections/connection_modules";
import {Blockchains, PolygonActivity, ZkSyncActivity} from "./module_blockchains/blockchain_modules";

////////////////////////////////////////////////////////////////////////
// Later we will get it from UI, now it's hardcoded for testing
////////////////////////////////////////////////////////////////////////

const POLYGON_ACTIONS: ModuleActions = {
    chainName: Blockchains.Polygon,
    randomOrder: Randomness.OnlyActivities,
    activityNames: [PolygonActivity.Project1]
}

const ZKSYNC_ACTIONS: ModuleActions = {
    chainName: Blockchains.ZkSync,
    randomOrder: Randomness.OnlyActivities,
    activityNames: [ZkSyncActivity.Project1, ZkSyncActivity.Project2]
}

const CONNECTION_OKX_TO_POLYGON: ConnectionAction = {
    from: Destination.OKX,
    to: Destination.Polygon,
    asset: Asset.ETH,
    amount: 0.2,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_ZKSYNC_TO_OKX: ConnectionAction = {
    from: Destination.ZkSync,
    to: Destination.OKX,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_POLYGON_TO_ZKSYNC: ConnectionAction = {
    from: Destination.Polygon,
    to: Destination.ZkSync,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.BridgeLZ
}

const ACTIONS_1: Actions = {
    actions: [
        CONNECTION_OKX_TO_POLYGON,
        POLYGON_ACTIONS,
        CONNECTION_POLYGON_TO_ZKSYNC,
        ZKSYNC_ACTIONS,
        CONNECTION_ZKSYNC_TO_OKX
    ]
}

export const WALLETS_ACTIONS: {[id: string]: Actions} = {
    "0x..1": ACTIONS_1,
    // "0x..2": ACTIONS_1
}

////////////////////////////////////////////////////////////////////////