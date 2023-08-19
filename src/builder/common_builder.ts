import {buildZkSyncBasic} from "./zksync_builder";
import {WalletActions} from "../classes/actions";

export enum Strategy {
    TestMode = "TestMode",
    ZkSyncBasic = "ZkSyncBasic"
}

export class Builder {

    public static async build(activeAddresses: string[], strategy: Strategy): Promise<WalletActions[]> {
        switch (strategy) {
            case Strategy.ZkSyncBasic:
                return await buildZkSyncBasic(activeAddresses)
            default:
                return []
        }
    }

}