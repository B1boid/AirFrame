import {AnyActions, ConnectionAction, ModuleActions, Randomness, WalletActions} from "../classes/actions";
import {getTxCount, hasInteractionWithEthContract} from "./features";
import {
    arbitrumChain,
    Blockchains,
    Destination,
    ethereumChain,
    optimismChain,
    scrollChain,
    zkSyncChain
} from "../config/chains";
import {Asset} from "../config/tokens";
import {Connections} from "../module_connections/connection_modules";
import {getMedian, getRandomElement, getRandomFloat, getRandomInt, shuffleArray} from "../utils/utils";
import {
    ArbActivity,
    EthereumActivity,
    OptimismActivity,
    ScrollActivity,
    ZkSyncActivity
} from "../module_blockchains/blockchain_modules";
import {globalLogger} from "../utils/logger";


interface ExtendedFeatures {
    walletAddress: string,
    ethTxs: number,
    zkTxs: number,
    optTxs: number,
    arbTxs: number,
    scrollTxs: number,
    hasOffBridge: boolean
}


export async function buildZkSyncAnother(activeAddresses: string[]): Promise<WalletActions[]> {
    let accountInfos: ExtendedFeatures[] = []
    for (let address of activeAddresses){
        let features = await getAccountInfo(address)
        if (features === null) {
            throw new Error(`Failed to get features for ${address}`)
        }
        accountInfos.push(features)
    }
    shuffleArray(accountInfos)
    accountInfos.sort(
        function(a: ExtendedFeatures, b: ExtendedFeatures){
            return a.scrollTxs > b.scrollTxs ? 1 : -1
            // if(a.hasOffBridge === b.hasOffBridge){
            //     return a.zkTxs > b.zkTxs ? 1 : -1;
            // }else{
            //     return a.hasOffBridge ? 1 : -1;
            // }
        }
    );
    let res: WalletActions[] = []
    for (let accInfo of accountInfos) {
        res.push(generateActions(accInfo))
    }
    printStats(accountInfos)

    return res
}

function printStats(accs: ExtendedFeatures[]){
    let zeroAccs = 0
    let accsWithOffBridge = 0
    let avgNonZeroEthTxs: number[] = []
    let avgNonZeroZkTxs: number[] = []
    let avgNonZeroScrollTxs: number[] = []
    for (let accInfo of accs) {
        zeroAccs += accInfo.zkTxs === 0 && accInfo.ethTxs === 0 ? 1 : 0
        accsWithOffBridge += accInfo.hasOffBridge ? 1 : 0
        if (accInfo.zkTxs > 0) {
            avgNonZeroZkTxs.push(accInfo.zkTxs)
        }
        if (accInfo.ethTxs > 0) {
            avgNonZeroEthTxs.push(accInfo.ethTxs)
        }
        if (accInfo.scrollTxs > 0) {
            avgNonZeroScrollTxs.push(accInfo.scrollTxs)
        }
    }
    globalLogger.done(
        `\nTotal accounts: ${accs.length}\nZero accounts: ${zeroAccs}\nAccs off-bridge: ${accsWithOffBridge}\nAvg non-zero ethTxs: ${getMedian(avgNonZeroEthTxs)}\nAvg non-zero zkTxs: ${getMedian(avgNonZeroZkTxs)}\nAvg non-zero scrollTxs: ${getMedian(avgNonZeroScrollTxs)}`
    )
}

export async function getAccountInfo(address: string, retries: number = 1): Promise<ExtendedFeatures | null> {
    if (retries < 0) return null
    try {
        let ethTxs = await getTxCount(address, ethereumChain)
        let zkTxs = await getTxCount(address, zkSyncChain)
        let optTxs = await getTxCount(address, optimismChain)
        let arbTxs = await getTxCount(address, arbitrumChain)
        let scrollTxs = await getTxCount(address, scrollChain)
        let hasOffBridge = await hasInteractionWithEthContract(address, "0x32400084C286CF3E17e7B677ea9583e60a000324")
        if (ethTxs === null || zkTxs === null || hasOffBridge === null || optTxs === null || arbTxs === null || scrollTxs === null) {
            return null
        }
        return {
            walletAddress: address,
            ethTxs: ethTxs,
            zkTxs: zkTxs,
            optTxs: optTxs,
            arbTxs: arbTxs,
            scrollTxs: scrollTxs,
            hasOffBridge: hasOffBridge
        }
    } catch (e) {
        return await getAccountInfo(address, retries - 1)
    }
}

const BRIDGE_ALL_ETHEREUM_TO_ZKSYNC: ConnectionAction = {
    from: Destination.Ethereum,
    to: Destination.ZkSync,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.OfficialZkSyncBridge
}

function generateActions(accInfo: ExtendedFeatures): WalletActions {
    let actions: AnyActions[] = []
    generatePathToZkSync(accInfo, actions)
    generateZkSync(accInfo, actions)
    generateScroll(accInfo, actions)
    return {
        address: accInfo.walletAddress,
        actions: actions,
        featuresLine: `ethTxs: ${accInfo.ethTxs}, zkTxs: ${accInfo.zkTxs}, scrollTxs: ${accInfo.scrollTxs}, hasOffBridge: ${accInfo.hasOffBridge}`
    }
}

function generatePathToZkSync(accInfo: ExtendedFeatures, actions: AnyActions[]): void {
    if (!accInfo.hasOffBridge){
        const CONNECTION_OKX_TO_ETHEREUM: ConnectionAction = {
            from: Destination.OKX,
            to: Destination.Ethereum,
            asset: Asset.ETH,
            amount: getRandomFloat(0.40, 0.70, 2),
            connectionName: Connections.ExchangeOKX
        }
        actions.push(CONNECTION_OKX_TO_ETHEREUM)
        if (accInfo.ethTxs > 8){ // if old account with eth txs
            actions.push(generateEthRandomActivities(1, 0))
        } else {
            actions.push(generateEthRandomActivities(getRandomInt(3, 6), 75))
        }
        actions.push(BRIDGE_ALL_ETHEREUM_TO_ZKSYNC)
    } else {
        if (accInfo.ethTxs > 9) {
            const CONNECTION_OKX_TO_ZKSYNC: ConnectionAction = {
                from: Destination.OKX,
                to: Destination.ZkSync,
                asset: Asset.ETH,
                amount: getRandomFloat(0.25, 0.70, 2),
                connectionName: Connections.ExchangeOKX
            }
            actions.push(CONNECTION_OKX_TO_ZKSYNC)
        } else {
            const CONNECTION_OKX_TO_ETHEREUM: ConnectionAction = {
                from: Destination.OKX,
                to: Destination.Ethereum,
                asset: Asset.ETH,
                amount: getRandomFloat(0.20, 0.60, 2),
                connectionName: Connections.ExchangeOKX
            }
            actions.push(CONNECTION_OKX_TO_ETHEREUM)
            const remainEthTxs = Math.min(5, 11 - accInfo.ethTxs) // target at least ~10 eth txs
            actions.push(generateEthRandomActivities(getRandomInt(remainEthTxs - 1, remainEthTxs), 0))

            const PERCENT_TO_USE_OFFICIAL_BRIDGE_AGAIN = 10
            if (getRandomInt(0, 100) < PERCENT_TO_USE_OFFICIAL_BRIDGE_AGAIN) {
                actions.push(BRIDGE_ALL_ETHEREUM_TO_ZKSYNC)
            } else {
                const CONNECTION_ETHEREUM_TO_OKX: ConnectionAction = {
                    from: Destination.Ethereum,
                    to: Destination.OKX,
                    asset: Asset.ETH,
                    amount: -1,
                    connectionName: Connections.ExchangeOKX
                }
                actions.push(CONNECTION_ETHEREUM_TO_OKX)
                const CONNECTION_OKX_TO_ZKSYNC: ConnectionAction = {
                    from: Destination.OKX,
                    to: Destination.ZkSync,
                    asset: Asset.ETH,
                    amount: getRandomFloat(0.25, 0.70, 2),
                    connectionName: Connections.ExchangeOKX
                }
                actions.push(CONNECTION_OKX_TO_ZKSYNC)
            }
        }
    }
}

function generateEthRandomActivities(activitiesNum: number, chanceInPercentToMintNft: number = 0): ModuleActions {
    let availableActivities: EthereumActivity[] = [
        EthereumActivity.ethRandomApprove, EthereumActivity.ethRandomApprove, // x2 chance
        EthereumActivity.ethRandomStuff, EthereumActivity.ethRandomStuff, // x2 chance
        EthereumActivity.ethFakeUniExec, EthereumActivity.ethFakeUniExec, // x2 chance
        EthereumActivity.wrapUnwrap,
        EthereumActivity.ethBlurCycle,
        EthereumActivity.ethDepositToZkLite,
        EthereumActivity.ethMoveDustGas,
        EthereumActivity.ethDepositToArbOfficial,
    ]
    let res: EthereumActivity[] = []
    if (getRandomInt(0, 100) < chanceInPercentToMintNft) {
        res.push(EthereumActivity.ethRandomMint)
    }
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: EthereumActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (curActivity === EthereumActivity.ethRandomApprove && res.filter(x => x === curActivity).length < 2){
                break
            }
            if (curActivity === EthereumActivity.ethRandomStuff && res.filter(x => x === curActivity).length < 2){
                break
            }
            if (!res.includes(curActivity)) {
                break
            }
        }
        res.push(curActivity)
    }
    return {
        chainName: Blockchains.Ethereum,
        randomOrder: Randomness.Full,
        activityNames: res
    }
}

function generateZkSync(accInfo: ExtendedFeatures, actions: AnyActions[]): void {
    let activities: ZkSyncActivity[]
    if (accInfo.zkTxs === 0){
        activities = generateZkSyncRandomActivities(getRandomInt(2, 3))
        if (getRandomInt(0, 100) < 85) { // 85% chance to mint tevaera
            activities.push(ZkSyncActivity.zkSyncMintTevaera)
        }
        if (getRandomInt(0, 100) < 65) { // 65% chance to mint znsid
            activities.push(ZkSyncActivity.zkSyncMintZnsId)
        }
        if (getRandomInt(0, 100) < 35) { // 35% chance to enterMarketsZkEra
            activities.push(ZkSyncActivity.zkSyncEraLendInit)
        }
        if (getRandomInt(0, 100) < 35) { // 35% chance to enterMarketsReactFusion
            activities.push(ZkSyncActivity.zkSyncReactFusionInit)
        }
        if (getRandomInt(0, 100) < 35) { // 35% chance to mint test tokens
            activities.push(ZkSyncActivity.zkSyncSynFuturesTest)
        }
    } else {
        activities = generateZkSyncRandomActivities(getRandomInt(2, 3))
    }
    const ZKSYNC_ACTIONS: ModuleActions = {
        chainName: Blockchains.ZkSync,
        randomOrder: Randomness.Full,
        activityNames: activities
    }
    actions.push(ZKSYNC_ACTIONS)

    const BRIDGE_ORBITER_ZKSYNC_TO_SCROLL: ConnectionAction = {
        from: Destination.ZkSync,
        to: Destination.Scroll,
        asset: Asset.ETH,
        amount: -1,
        connectionName: Connections.Orbiter
    }
    actions.push(BRIDGE_ORBITER_ZKSYNC_TO_SCROLL)

}

function generateZkSyncRandomActivities(activitiesNum: number): ZkSyncActivity[] {
    let availableActivities: ZkSyncActivity[] = [
        // ZkSyncActivity.zkSyncRandomApprove,
        ZkSyncActivity.zkSyncDummyRandomSwapCycle,
        ZkSyncActivity.zkSyncDummyRandomLending,
        ZkSyncActivity.zkSyncDmail
    ]
    let res: ZkSyncActivity[] = []
    let repeatedActivities: ZkSyncActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ZkSyncActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        if (curActivity === ZkSyncActivity.zkSyncDummyRandomLending) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncParaspaceCycle, ZkSyncActivity.zkSyncEraLendCycle, ZkSyncActivity.zkSyncReactFusionCycle
            ]
            res.push(getRandomElement(lendingActivities))
        } else if (curActivity === ZkSyncActivity.zkSyncDummyRandomSwapCycle) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncTopSwapCycleNativeToUsdc, ZkSyncActivity.zkSyncSwapCycleNativeToUsdc
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }
        repeatedActivities.push(curActivity)
    }
    return res
}

function generateOptimismActivities(activitiesNum: number): ModuleActions {
    let availableActivities: OptimismActivity[] = [
        OptimismActivity.optRandomStuff,
        OptimismActivity.optDummyLendingCycle,
        // OptimismActivity.optSwapCycleNativeToUsdc,
        OptimismActivity.optFakeUniExec,
        OptimismActivity.optMoveDustGas,
        OptimismActivity.optRandomApprove,
        OptimismActivity.optOptimismDelegate
    ]

    let res: OptimismActivity[] = []
    let repeatedActivities: OptimismActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: OptimismActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        if (curActivity === OptimismActivity.optDummyLendingCycle) {
            let lendingActivities: OptimismActivity[] = [
                OptimismActivity.optAaveCycle, OptimismActivity.optAaveCycle, OptimismActivity.optGranaryCycle
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }
        repeatedActivities.push(curActivity)
    }
    return {
        chainName: Blockchains.Optimism,
        randomOrder: Randomness.Full,
        activityNames: res
    }
}

function generateArbitrumActivities(activitiesNum: number): ModuleActions {
    let availableActivities: ArbActivity[] = [
        ArbActivity.arbRandomStuff,
        ArbActivity.arbAaveCycle,
        // ArbActivity.arbSwapCycleNativeToUsdc,
        ArbActivity.arbRandomApprove,
        ArbActivity.arbArbitrumDelegate,
        ArbActivity.arbFakeUniExec,
        ArbActivity.arbMoveDustGas,
        ArbActivity.arbFriendsTech,
    ]

    let res: ArbActivity[] = []
    let repeatedActivities: ArbActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ArbActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        res.push(curActivity)
        repeatedActivities.push(curActivity)
    }
    return {
        chainName: Blockchains.Arbitrum,
        randomOrder: Randomness.Full,
        activityNames: res
    }
}

function generateScroll(accInfo: ExtendedFeatures, actions: AnyActions[]): void {
    let activities: ScrollActivity[] = generateScrollActivities(getRandomInt(1, 2))
    // по идеи все заклеймиили уже
    // if (accInfo.scrollTxs !== 0){
    //     activities.push(ScrollActivity.scrollOffMint)
    // }
    const SCROLL_ACTIONS: ModuleActions = {
        chainName: Blockchains.Scroll,
        randomOrder: Randomness.Full,
        activityNames: activities
    }
    actions.push(SCROLL_ACTIONS)


    if ((accInfo.optTxs > 0 && accInfo.arbTxs === 0) || getRandomInt(0, 100) < 66){ // 66% chance to use optimism
        const BRIDGE_ORBITER_SCROLL_TO_OPTIMISM: ConnectionAction = {
            from: Destination.Scroll,
            to: Destination.Optimism,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.Orbiter
        }
        actions.push(BRIDGE_ORBITER_SCROLL_TO_OPTIMISM)
        actions.push(
            generateOptimismActivities(getRandomInt(0, 3))
        )
        const CONNECTION_OPTIMISM_TO_OKX: ConnectionAction = {
            from: Destination.Optimism,
            to: Destination.OKX,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.ExchangeOKX
        }
        actions.push(CONNECTION_OPTIMISM_TO_OKX)
    } else {
        const BRIDGE_ORBITER_SCROLL_TO_ARB: ConnectionAction = {
            from: Destination.Scroll,
            to: Destination.Arbitrum,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.Orbiter
        }
        actions.push(BRIDGE_ORBITER_SCROLL_TO_ARB)
        actions.push(
            generateArbitrumActivities(getRandomInt(0, 2))
        )
        const CONNECTION_ARB_TO_OKX: ConnectionAction = {
            from: Destination.Arbitrum,
            to: Destination.OKX,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.ExchangeOKX
        }
        actions.push(CONNECTION_ARB_TO_OKX)
    }
}

function generateScrollActivities(activitiesNum: number): ScrollActivity[] {
    let availableActivities: ScrollActivity[] = [
        ScrollActivity.scrollDmail,
        // ScrollActivity.scrollWrapUnwrap,
        ScrollActivity.scrollRandomStuff,
        // ScrollActivity.scrollRandomApprove,
        ScrollActivity.scrollEmptyRouter,
        ScrollActivity.scrollSwapCycleNativeToUsdc
    ]

    let res: ScrollActivity[] = []
    let repeatedActivities: ScrollActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ScrollActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        res.push(curActivity)
        repeatedActivities.push(curActivity)
    }
    return res
}
