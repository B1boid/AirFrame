import {ConnectionModule} from "../../classes/connection";
import {WalletI} from "../../classes/wallet";
import {Destination, destToChain} from "../../config/chains";
import {Asset} from "../../config/tokens";

class OrbiterConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<boolean> {
        return Promise.resolve(false)
    }

}

export const orbiterConnectionModule: OrbiterConnectionModule = new OrbiterConnectionModule()
