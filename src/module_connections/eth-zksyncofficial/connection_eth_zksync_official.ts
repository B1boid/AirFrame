import {ConnectionModule} from "../../classes/connection";
import {WalletI} from "../../classes/wallet";
import {Destination} from "../../config/chains";

class ZkSyncEthOfficialConectionModule implements ConnectionModule {
    sendAsset(wallet: WalletI, from: Destination, to: Destination, asset, amount: number): Promise<boolean> {
        return Promise.resolve(false);
    }

}

export const zkSyncEthConnectionModule: ZkSyncEthOfficialConectionModule = new ZkSyncEthOfficialConectionModule()
