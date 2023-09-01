import {buildZkSyncBasic} from "./zksync_builder";
import {WalletActions} from "../classes/actions";
import {buildZkSyncMains} from "./zksync_mains_builder";

export enum Strategy {
    TestMode = "TestMode",
    ZkSyncBasic = "ZkSyncBasic",
    ZkSyncMains = "ZkSyncMains"
}

export class Builder {

    public static async build(activeAddresses: string[], strategy: Strategy): Promise<WalletActions[]> {
        switch (strategy) {
            case Strategy.ZkSyncBasic:
                return await buildZkSyncBasic(activeAddresses)
            case Strategy.ZkSyncMains:
                return await buildZkSyncMains(activeAddresses)
            default:
                return []
        }
    }

}