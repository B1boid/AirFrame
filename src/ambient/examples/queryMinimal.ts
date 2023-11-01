/* Example script to make a query call to CrocQuery contract with
 * minimal syntactic sugar from the SDK, to make clear what's going on. */

import { Contract, ethers, providers } from "ethers"
import { QUERY_ABI } from "../abis"
import { CHAIN_SPECS } from "../constants"

// Goerli network addresses
const ETH = ethers.constants.AddressZero
const USDC = "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C"

// CrocQuery adddress
const QUERY_CONTRACT_ADDR = "0x93a4baFDd49dB0e06f3F3f9FddC1A67792F47518"

// Standard pool type index on Goerli
const POOL_IDX = 36000

// Goerli RPC endpoint
const rpc = CHAIN_SPECS["0x5"].nodeUrl

async function queryContract() {
    const provider = new providers.JsonRpcProvider(rpc)

    const query = new Contract(QUERY_CONTRACT_ADDR, QUERY_ABI, provider)

    // Note this is the on-chain representation, not the display price
    const chainPrice = await query.queryPrice(ETH, USDC, POOL_IDX)
    console.log("On chain pool price is ", chainPrice.toString())
}

queryContract()
