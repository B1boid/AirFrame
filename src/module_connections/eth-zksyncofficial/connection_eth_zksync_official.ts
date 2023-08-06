import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Destination, destToChain} from "../../config/chains";
import {ConsoleLogger, ILogger} from "../../utils/logger";
import {Asset} from "../../config/tokens";
import {TxInteraction} from "../../classes/module";

const tag = "Official ZkSync bridge"

class ZkSyncEthOfficialConectionModule implements ConnectionModule {
    private logger: ILogger

    constructor(logger: ILogger = new ConsoleLogger("0x0")) {
        this.logger = logger
    }

    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<boolean> {
        if (!(from === Destination.ZkSync && to === Destination.Ethereum ||
            to === Destination.ZkSync && from === Destination.Ethereum)) {
            this.logger
                .error(`Wrong networks for ${tag}. Expected ZKSYNC <-> ETH. Found: ${from} -> ${to}.`)
            return Promise.resolve(false)
        }

        if (asset !== Asset.ETH) {
            this.logger.error(`Only ETH supported for ${tag}.`)
            return Promise.resolve(false)
        }

        const tx = this.buildTx(wallet, from, amount)
        const homeResponse = await wallet.sendTransaction(tx, destToChain(from), 1)

        if (homeResponse === TxResult.Fail) {
            this.logger.error(`Failed tx for bridging ${from} -> ${to} using ${tag}.`)
            return Promise.resolve(false)
        }

        return await this.waitBalanceUpdate(wallet, to);
    }

    private buildTx(wallet: WalletI, from: Destination, amount: number): TxInteraction {
        // TODO add interaction and chack from chain
        return {
            name: `${tag}: Brudge ETH from Ethereum to ZkSync.`,
            to: wallet.getAddress(),
            data: "add data",
            confirmations: 1,
            value: amount.toString(),
            stoppable: false
        }
    }

    private waitBalanceUpdate(wallet: WalletI, to: Destination): Promise<boolean> {
        // TODO add waiting logic for both chains
        return Promise.resolve(false)
    }

}

export const zkSyncEthConnectionModule: ZkSyncEthOfficialConectionModule = new ZkSyncEthOfficialConectionModule()
