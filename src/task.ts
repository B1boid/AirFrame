import {Actions, Asset, ConnectionAction, ModuleActions, Randomness} from "./classes/actions";
import {Destination} from "./config/chains";
import {Connections} from "./module_connections/connection_modules";
import {Blockchains} from "./modules/blockchain_modules";

////////////////////////////////////////////////////////////////////////
// Later we will get it from UI, now it's hardcoded for testing
////////////////////////////////////////////////////////////////////////

const POLYGON_ACTIONS: ModuleActions = {
    chainName: Blockchains.polygon,
    randomOrder: Randomness.onlyActivities,
    activityNames: ["polygonProject1"]
}

const ZKSYNC_ACTIONS: ModuleActions = {
    chainName: Blockchains.zkSync,
    randomOrder: Randomness.onlyActivities,
    activityNames: ["zksyncProject1", "zksyncProject2"]
}

const CONNECTION_OKX_TO_POLYGON: ConnectionAction = {
    from: Destination.okx,
    to: Destination.polygon,
    asset: Asset.ETH,
    amount: 0.2,
    connectionName: Connections.exchange_okx
}

const CONNECTION_ZKSYNC_TO_OKX: ConnectionAction = {
    from: Destination.zkSync,
    to: Destination.okx,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.exchange_okx
}

const CONNECTION_POLYGON_TO_ZKSYNC: ConnectionAction = {
    from: Destination.polygon,
    to: Destination.zkSync,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.bridge_lz
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