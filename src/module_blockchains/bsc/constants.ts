import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const bscTokens: EnumDictionary<Asset, string> = {
    [Asset.BNB]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.USDT]: "0x55d398326f99059fF775485246999027B3197955",
    [Asset.WBNB]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    [Asset.XRP]: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    [Asset.USDC]: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    [Asset.ADA]: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    [Asset.DOGE]: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    [Asset.TONCOIN]: "0x76A797A59Ba2C17726896976B7B3747BfD1d220f",
    [Asset.DAI]: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    [Asset.MATIC]: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    [Asset.SHIB]: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
    [Asset.BUSD]: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
}


export const bscContracts: { [id: string]: string } = {
    oneInchRouter: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
    odosRouter: "0x89b8AA89FDd0507a99d334CBe3C808fAFC7d850E",
    paraswapRouter: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
    pancakeRouter: "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F",

    kinzaDepo: "0xCC650b486f723C924370656b509a82bD69526739",
    bnbKinzaWrapped: "0xf5e0ADda6Fb191A332A787DEeDFD2cFFC72Dba0c"


}