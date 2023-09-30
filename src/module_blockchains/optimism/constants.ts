import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const optTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WETH]: "0x4200000000000000000000000000000000000006",
    [Asset.USDT]: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    [Asset.USDC]: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    [Asset.OP]: "0x4200000000000000000000000000000000000042",
    [Asset.WBTC]: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    [Asset.LINK]: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
    [Asset.LDO]: "0xFdb794692724153d1488CcdBE0C56c252596735F",
    [Asset.FRAX]: "0x2E3D870790dC77A83DD1d18184Acc7439A53f475",
    [Asset.RPL]: "0xC81D1F0EB955B0c020E5d5b264E1FF72c14d1401",
    [Asset.WLD]: "0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1",
    [Asset.CBETH]: "0xadDb6A0412DE1BA0F936DCaeb8Aaa24578dcF3B2",
}


export const optContracts: { [id: string]: string } = {
    oneInchRouter: "0x1111111254eeb25477b68fb85ed929f73a960582",
    odosRouter: "0xCa423977156BB05b13A2BA3b76Bc5419E2fE9680",
    paraswapRouter: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
    lifiRouter: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",

    aaveDepo: "0x76D3030728e52DEB8848d5613aBaDE88441cbc59",
    aavePool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    aaveWrapped: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",

    socketGasMover: "0x5800249621DA520aDFdCa16da20d8A5Fc0f814d8",
    universalRouter: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",

    nftMintHolo: "0x2c4BD4e25D83285f417E26a44069F41d1a8aD0e7",
}