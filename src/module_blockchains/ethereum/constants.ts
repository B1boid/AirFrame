import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const ethTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WETH]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    [Asset.USDC]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    [Asset.USDT]: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    [Asset.STETH]: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    [Asset.RETH]: "0xae78736Cd615f374D3085123A210448E74Fc6393",
    [Asset.DAI]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    [Asset.LUSD]: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
    [Asset.BUSD]: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    [Asset.WBTC]: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    [Asset.IMX]: "0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF",
    [Asset.SNX]: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
    [Asset.GRT]: "0xc944E90C64B2c07662A292be6244BDf05Cda44a7",
    [Asset.LINK]: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    [Asset.AAVE]: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    [Asset.CRV]: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    [Asset.UNI]: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    [Asset.SUSHI]: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
    [Asset.SHIB]: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    [Asset.LDO]: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
    [Asset.PEPE]: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    [Asset.DYDX]: "0x92D6C1e31e14520e676a687F0a93788B716BEff5",
    [Asset.COMP]: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    [Asset.WLD]: "0x163f8C2467924be0ae7B5347228CABF260318753",
    [Asset.BLUR]: "0x5283D291DBCF85356A21bA090E6db59121208b44",
    [Asset.ENS]: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
    [Asset.BAL]: "0xba100000625a3754423978a60c9317c58a424e3D",
    [Asset.STG]: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
    [Asset.SAND]: "0x3845badAde8e6dFF049820680d1F14bD3903a5d0",
    [Asset.FRAX]: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
    [Asset.APE]: "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
    [Asset.FXS]: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
    [Asset.ILV]: "0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E",
    [Asset.CVX]: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
    [Asset.ENJ]: "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c"

}


export const ethContracts: { [id: string]: string } = {

    zkLite: "0xaBEA9132b05A70803a4E85094fD0e1800777fBEF",
    arbOffBridge: "0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f",

    blurDeposit: "0x0000000000A39bb272e79075ade125fd351887Ac",
    socketGasMover: "0xb584D4bE1A5470CA1a8778E9B86c81e165204599",

    // random routers
    universalRouter: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    uniOldRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
    lifiRouter: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
    openOceanRouter: "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64",
    metamaskRouter: "0x881D40237659C251811CEC9c364ef91dC08D300C",

    // NFTs to mint
    nftMintZerion: "0x932261f9Fc8DA46C4a22e31B45c4De60623848bF",
    nftMintParrot: "0x2F47cA81a38CB76F94256706750a4eA879E7CF9F",
    nftMintDream: "0xCAE5E96069cdc4bCbc05f81bA0707d51BC02BFf5",
    nftMintRaid: "0x0A791089ACf48912a9Cfde00E3A6aFe9eDBC3221",
    nftMintGlow: "0x7BB824EceD0a777C17ac0000B0E7f8e036F1538f",

    claimNFTx: "0x688c3E4658B5367da06fd629E41879beaB538E37",
    claimApe: "0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9"

}