import {polygonContracts} from "./module_blockchains/polygon/constants";
import {AzuroBet, Condition, Match} from "./classes/azuro-classes";
import {Alchemy, Network, AlchemySubscription} from "alchemy-sdk";
import {getPotentialBet, scrap} from "./utils/azuro-utils";
import {sleep} from "./utils/utils";

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.MATIC_MAINNET,
};

let condId2Match: { [key: string]: Match };

async function cacheFetcher() {
    while (true) {
        try {
            condId2Match = await scrap()
            // console.log(Object.keys(condId2Match).length)
        } catch (e){
            console.log("EEE", e)
        }
        await sleep(5)
    }
}

async function analyzeData(bet: AzuroBet) {
    if (bet.amount < 100 * 10 ** 6) {
        let condition: Condition = condId2Match[bet.condId].conditions[bet.condId]
        console.log("SMALL:", bet, condition)
        return
    }
    for (let i = 0; i < 10; i++) {
        let condition: Condition = condId2Match[bet.condId].conditions[bet.condId]
        console.log(i, bet, condition)
        await sleep(5)
    }
}

async function followAddress() {
    const alchemy = new Alchemy(settings);
    cacheFetcher()
    console.log("Start")

    alchemy.ws.on(
        {
            method: AlchemySubscription.PENDING_TRANSACTIONS,
            toAddress: polygonContracts.azuroBet,
        },
        (tx) => {
            // console.log(tx)
            let azuroBet: AzuroBet | null = getPotentialBet(tx.input)
            console.log(azuroBet)
            if (azuroBet !== null) {
                analyzeData(azuroBet)
            }

            console.log("------------------")
        }
    );

}

followAddress()
