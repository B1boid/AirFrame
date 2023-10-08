import {polygonContracts} from "./module_blockchains/polygon/constants";
import {defaultAbiCoder} from "ethers/lib/utils";
import {AzuroBet} from "./classes/azuro-classes";
import { Alchemy, Network, AlchemySubscription } from "alchemy-sdk";

const settings = {
    apiKey: process.env.INFURA_API_KEY,
    network: Network.MATIC_MAINNET,
};

function analyzeData(_data: string): AzuroBet | null {
    try {
        if (_data.startsWith("0xe0ccea9d")){
            return null
        }
        let data = "0x" + _data.slice("0xe0ccea9d".length)
        console.log("Time:", (new Date()).toString());
        let decoded = defaultAbiCoder.decode(
            ['address', 'tuple(address,uint128,uint64,tuple(address,uint64,bytes))[]'],
            data
        )
        console.log(decoded[1])

        if (decoded[1][0][0] !== polygonContracts.azuroCore){
            return null
        }

        let amount: number = Number.parseInt(decoded[1][0][1].toString())
        let odd: number = Number.parseInt(decoded[1][0][3][1].toString())
        let rawData = decoded[1][0][3][2].toString()
        let decodedRaw = defaultAbiCoder.decode(
            ['tuple(uint256, uint64)'],
            rawData
        )
        let condId = decodedRaw[0][0].toString()
        let outcomeId = decodedRaw[0][1].toString()
        return {
            amount: amount,
            condId: condId,
            outcomeId: outcomeId,
            odd: odd
        }
    } catch (e){
        return null
    }
}

async function followAddress(){
    const alchemy = new Alchemy(settings);
    console.log("Start")

    alchemy.ws.on(
        {
            method: AlchemySubscription.PENDING_TRANSACTIONS,
            toAddress: polygonContracts.azuroBet,
        },
        (tx) => {
            console.log(tx)
            console.log(analyzeData(tx.input))
            console.log("------------------")
        }
    );

}

followAddress()
