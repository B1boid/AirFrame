import {buildZkSyncBasic} from "./zksync_builder";
import {WalletActions} from "../classes/actions";
import {buildZkSyncMains} from "./zksync_mains_builder";
import {buildZkSyncAnother} from "./zksync_another_builder";

export enum Strategy {
    TestMode = "TestMode",
    ZkSyncBasic = "ZkSyncBasic",
    ZkSyncMains = "ZkSyncMains",
    ZkSyncAnother = "ZkSyncAnother",
}

export class Builder {

    public static async build(activeAddresses: string[], strategy: Strategy): Promise<WalletActions[]> {
        switch (strategy) {
            case Strategy.ZkSyncBasic:
                return await buildZkSyncBasic(activeAddresses)
            case Strategy.ZkSyncMains:
                return await buildZkSyncMains(activeAddresses)
            case Strategy.ZkSyncAnother:
                return await buildZkSyncAnother(activeAddresses)
            default:
                return []
        }
    }

}