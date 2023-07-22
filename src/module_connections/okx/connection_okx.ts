import {ConnectionModule} from "../../classes/connection";
import {WalletI} from "../../classes/wallet";
import {Destination} from "../../config/chains";

class OkxConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: string, amount: number): Promise<boolean> {
        return Promise.resolve(true);
    }

}

export const okxConnectionModule: OkxConnectionModule = new OkxConnectionModule()
