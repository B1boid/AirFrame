import {buildZkSyncBasic} from "./zksync_builder";
import {WalletActions} from "../classes/actions";
import {buildZkSyncMains} from "./zksync_mains_builder";
import {buildZkSyncAnother} from "./zksync_another_builder";
import {getActiveAddresses} from "../utils/utils";
import {buildMegaladona} from "./mega_builder";

export enum Strategy {
    TestMode = "TestMode",
    ZkSyncBasic = "ZkSyncBasic", //@old
    ZkSyncMains = "ZkSyncMains", // without bridging for main accounts with balance
    ZkSyncAnother = "ZkSyncAnother", // classic zksync for multi-accounts
    MegaStrata = "MegaStrata" // 200iq
}

export class Builder {

    public static async build(strategy: Strategy): Promise<WalletActions[]> {
        switch (strategy) {
            case Strategy.ZkSyncBasic:
                return await buildZkSyncBasic(getActiveAddresses())
            case Strategy.ZkSyncMains:
                return await buildZkSyncMains(getActiveAddresses())
            case Strategy.ZkSyncAnother:
                return await buildZkSyncAnother(getActiveAddresses())
            case Strategy.MegaStrata:
                return await buildMegaladona()
            default:
                return []
        }
    }

}