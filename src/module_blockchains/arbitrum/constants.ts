import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const arbTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.USDT]: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    [Asset.USDC]: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    [Asset.LINK]: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    [Asset.WBTC]: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    [Asset.DAI]: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    [Asset.UNI]: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    [Asset.ARB]: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    [Asset.GRT]: "0x9623063377AD1B27544C965cCd7342f7EA7e88C7",
    [Asset.GMX]: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    [Asset.RDNT]: "0x3082CC23568eA640225c2467653dB90e9250AaA0",
    [Asset.AGEUR]: "0xFA5Ed56A203466CbBC2430a43c66b9D8723528E7"

}


export const arbContracts: { [id: string]: string } = {
    oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
    paraswapRouter: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
    lifiRouter: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
    odosRouter: "0xa669e7A0d4b3e4Fa48af2dE86BD4CD7126Be4e13",

    aaveDepo: "0xB5Ee21786D28c5Ba61661550879475976B707099",
    aavePool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    aaveWrapped: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",

    socketGasMover: "0xc0E02AA55d10e38855e13B64A8E1387A04681A00",
    universalRouter: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    friendsTech: "0x87da6930626Fe0c7dB8bc15587ec0e410937e5DC"


}