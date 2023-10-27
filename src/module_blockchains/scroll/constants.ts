import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const scrollTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WETH]: "0x5300000000000000000000000000000000000004",
    [Asset.USDT]: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
    [Asset.USDC]: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
    [Asset.WBTC]: "0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1",
    [Asset.DAI]: "0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97",
    [Asset.WSTETH]: "0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32",
}


export const scrollContracts: { [id: string]: string } = {
    kyberSwapRouter: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",

    // spaceRouter: "0xbE7D1FD1f6748bbDefC4fbaCafBb11C6Fc506d1d",
    syncSwapRouter: "0x80e38291e06339d10AAB483C65695D004dBD5C69",
    iziRouter: "0x2db0AFD0045F3518c77eC6591a542e326Befd3D7",
}