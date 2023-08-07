import {Actions, ConnectionAction, ModuleActions, Randomness} from "../classes/actions";
import {Blockchains, Destination} from "../config/chains";
import {Connections} from "../module_connections/connection_modules";
import {PolygonActivity, ZkSyncActivity} from "../module_blockchains/blockchain_modules";
import {Asset} from "../config/tokens";
import {ethers} from "ethers-new";
import {zkSyncMintZnsId} from "../module_blockchains/zksync/activities";

////////////////////////////////////////////////////////////////////////
// Later we will get it from UI, now it's hardcoded for testing
////////////////////////////////////////////////////////////////////////

const POLYGON_ACTIONS: ModuleActions = {
    chainName: Blockchains.Polygon,
    randomOrder: Randomness.OnlyActivities,
    activityNames: [PolygonActivity.wrapUnwrap]
}

const ZKSYNC_ACTIONS: ModuleActions = {
    chainName: Blockchains.ZkSync,
    randomOrder: Randomness.OnlyActivities,
    activityNames: [ZkSyncActivity.zkSyncRandomApprove]
}

const CONNECTION_OKX_TO_POLYGON: ConnectionAction = {
    from: Destination.OKX,
    to: Destination.Polygon,
    asset: Asset.MATIC,
    amount: 1,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_OKX_TO_ZKSYNC: ConnectionAction = {
    from: Destination.OKX,
    to: Destination.ZkSync,
    asset: Asset.ETH,
    amount: 0.01,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_POLYGON_TO_OKX: ConnectionAction = {
    from: Destination.Polygon,
    to: Destination.OKX,
    asset: Asset.MATIC,
    amount: Number(ethers.parseEther("1")),
    connectionName: Connections.ExchangeOKX
}


const ACTIONS_1: Actions = {
    actions: [
        // CONNECTION_OKX_TO_ZKSYNC
        CONNECTION_OKX_TO_POLYGON,
        // POLYGON_ACTIONS,
        CONNECTION_POLYGON_TO_OKX
        // POLYGON_ACTIONS
        ZKSYNC_ACTIONS
    ]
}

export const WALLETS_ACTIONS_1: {[id: string]: Actions} = {
    "0x365c597620d13eA24DdC36A7Ff1Fb3224941Be19": ACTIONS_1,
    // "0x..2": ACTIONS_1
}

////////////////////////////////////////////////////////////////////////