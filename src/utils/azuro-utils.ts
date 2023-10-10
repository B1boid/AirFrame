import axios from "axios";
import {AZURO_QUERY, AzuroBet, Condition, Match, Odd} from "../classes/azuro-classes";
import {ethers} from "ethers-new";
import erc20 from "../abi/erc20.json";
import {polygonChain} from "../config/chains";
import {polygonContracts, polygonTokens} from "../module_blockchains/polygon/constants";
import {defaultAbiCoder} from "ethers/lib/utils";

export async function scrap(): Promise<{[key: string]: Match}>{
    const url = "https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-polygon-v3"
    let response = (await axios.post(url, {
        query: AZURO_QUERY,
        variables: {
            where: {
                startsAt_gt: Math.floor(Date.now() / 1000),
                hasActiveConditions: true,
            }
        }
    })).data.data.games

    let condId2Match: {[key: string]: Match} = {}
    for (let data of response){
        let conditions: {[key: string]: Condition} = {}
        for (let outcome of data.conditions){
            let percent = -1
            let odds: Odd[] = []
            for (let odd of outcome.outcomes){
                percent += 1 / Number.parseFloat(odd.currentOdds)
                odds.push({
                    odd: Number.parseFloat(odd.currentOdds),
                    outcomeId: odd.outcomeId
                })
            }
            conditions[outcome.conditionId] = {
                conditionId: outcome.conditionId,
                fee: percent,
                odds: odds
            }
        }
        for (let condId of Object.keys(conditions)){
            condId2Match[condId] = {
                slug: data.slug,
                time: Number.parseInt(data.startsAt),
                sport: data.sport.name,
                conditions: conditions
            }
        }
    }
    return condId2Match
}

export async function printBestBatches(am: number) {
    let condId2Match = await scrap()

    let sortedFees = Object.keys(condId2Match).map(function(key) {
        return [key, condId2Match[key]];
    });
    sortedFees.sort(function(first, second) {
        // @ts-ignore
        return (first[1] as Match).conditions[first[0]].fee - (second[1] as Match).conditions[second[0]].fee
    });

    for (let [condId, match] of sortedFees.slice(0, 10)){
        match = match as Match
        condId = condId as string
        console.log(match.slug)
        console.log(match.sport)
        console.log(new Date(match.time * 1000))
        console.log(match.conditions[condId].fee)
        console.log(match.conditions[condId].odds)
        for (let o of match.conditions[condId].odds){
            console.log(am / o.odd)
        }
        console.log("-------------")
    }
}


export async function checkUsdtBalance(addresses: string[]){
    let chain = polygonChain
    const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
    let tokenContract = new ethers.Contract(polygonTokens.USDT, erc20, provider)
    for (let addr of addresses){
        let tokenBalance: bigint = await tokenContract.balanceOf(addr)
        console.log(addr, ethers.formatUnits(tokenBalance , 6))
    }
}


export function getPotentialBet(_data: string): AzuroBet | null {
    try {
        if (!_data.startsWith("0xe0ccea9d")){
            return null
        }
        let data = "0x" + _data.slice("0xe0ccea9d".length)
        console.log("Time:", (new Date()).toString());
        let decoded = defaultAbiCoder.decode(
            ['address', 'tuple(address,uint128,uint64,tuple(address,uint64,bytes))[]'],
            data
        )

        if (decoded[1][0][0] !== polygonContracts.azuroCore){
            console.log("express")
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
        console.log(e)
        return null
    }
}

