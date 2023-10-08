import axios from "axios";
import {AZURO_QUERY, Condition, Match, Odd} from "../classes/azuro-classes";
import {ethers} from "ethers-new";
import erc20 from "../abi/erc20.json";
import {polygonChain} from "../config/chains";
import {polygonTokens} from "../module_blockchains/polygon/constants";

export async function scrap(am: number) {
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

    let matches: {[key: string]: Match} = {}
    let fees: {[key: string]: number} = {}
    for (let data of response){
        let conditions: Condition[] = []
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
            conditions.push({
                conditionId: outcome.conditionId,
                fee: percent,
                odds: odds
            })
            fees[data.gameId + "+" + outcome.conditionId] = percent
        }
        matches[data.gameId] = {
            slug: data.slug,
            time: Number.parseInt(data.startsAt),
            sport: data.sport.name,
            conditions: conditions
        }
    }

    let sortedFees = Object.keys(fees).map(function(key) {
        return [key, fees[key]];
    });
    sortedFees.sort(function(first, second) {
        // @ts-ignore
        return first[1] - second[1];
    });

    for (let el of sortedFees.slice(0, 10)){
        let [id, condId] = el[0].toString().split("+")
        console.log(matches[id].slug)
        console.log(matches[id].sport)
        console.log(new Date(matches[id].time * 1000))
        for (let odd of matches[id].conditions){
            if (odd.conditionId === condId){
                console.log(odd)
                for (let o of odd.odds){
                    console.log(am / o.odd)
                }
                break
            }
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

