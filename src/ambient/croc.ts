import { ConnectArg, CrocContext, connectCroc } from './context';
import { CrocPoolView } from './pool';
import { AddressZero } from '@ethersproject/constants';
import { TokenQty, CrocTokenView } from './tokens';
import { CrocSwapPlan } from './swap';
import { Signer } from 'ethers';
import { CrocKnockoutHandle } from './knockout';

export class CrocEnv {
    constructor (conn: ConnectArg, signer?: Signer) {
        this.context = connectCroc(conn, signer)     
        this.tokens = new TokenRepo(this.context)   
    }

    buy (token: string, qty: TokenQty): BuyPrefix {
        return new BuyPrefix(token, qty, this.tokens, this.context)
    }

    buyEth (qty: TokenQty): BuyPrefix {
        return new BuyPrefix(AddressZero, qty, this.tokens, this.context)
    }

    sell (token: string, qty: TokenQty): SellPrefix {
        return new SellPrefix(token, qty, this.tokens, this.context)
    }

    sellEth (qty: TokenQty): SellPrefix {
        return new SellPrefix(AddressZero, qty, this.tokens, this.context)
    }

    pool (tokenA: string, tokenB: string): CrocPoolView {
        const viewA = this.tokens.materialize(tokenA)
        const viewB = this.tokens.materialize(tokenB)
        return new CrocPoolView(viewA, viewB, this.context)
    }

    poolEth (token: string): CrocPoolView {
        return this.pool(token, AddressZero)
    }

    poolEthQuote (token: string): CrocPoolView {
        return this.pool(AddressZero, token)
    }

    token (token: string): CrocTokenView {
        return this.tokens.materialize(token)
    }

    tokenEth(): CrocTokenView {
        return this.tokens.materialize(AddressZero)
    }

    readonly context: Promise<CrocContext>
    tokens: TokenRepo
}

interface SwapArgs {
    slippage: number
}

const DFLT_SWAP_ARGS: SwapArgs = {
    slippage: 0.01
}

class BuyPrefix {
    constructor (token: string, qty: TokenQty, repo: TokenRepo, context: Promise<CrocContext>) {
        this.token = token
        this.qty = qty
        this.context = context
        this.repo = repo
    }

    with (token: string, args: SwapArgs = DFLT_SWAP_ARGS): CrocSwapPlan {
        return new CrocSwapPlan(this.repo.materialize(token), 
            this.repo.materialize(this.token), this.qty, true, args.slippage, this.context)
    }

    withEth (args: SwapArgs = DFLT_SWAP_ARGS): CrocSwapPlan {
        return this.with(AddressZero, args)
    }

    atLimit (token: string, tick: number): CrocKnockoutHandle {
        return new CrocKnockoutHandle(this.repo.materialize(token), 
            this.repo.materialize(this.token), this.qty, false, tick, this.context)
    }

    readonly token: string
    readonly qty: TokenQty
    readonly context: Promise<CrocContext>
    repo: TokenRepo
}

class SellPrefix {
    constructor (token: string, qty: TokenQty, repo: TokenRepo, context: Promise<CrocContext>) {
        this.token = token
        this.qty = qty
        this.context = context
        this.repo = repo
    }

    for (token: string, args: SwapArgs = DFLT_SWAP_ARGS): CrocSwapPlan {
        return new CrocSwapPlan(this.repo.materialize(this.token), 
            this.repo.materialize(token), this.qty, false, args.slippage, this.context)
    }

    forEth (args: SwapArgs = DFLT_SWAP_ARGS): CrocSwapPlan {
        return this.for(AddressZero, args)
    }

    atLimit (token: string, tick: number): CrocKnockoutHandle {
        return new CrocKnockoutHandle(this.repo.materialize(this.token), 
            this.repo.materialize(token), this.qty, true, tick, this.context)
    }

    readonly token: string
    readonly qty: TokenQty
    readonly context: Promise<CrocContext>
    repo: TokenRepo

}


/* Use this to cache the construction of CrocTokenView objects across CrocEnv lifetime.
 * Because token view construction makes on-chain calls to get token metadata, doing this
 * drastically reduces the number of RPC calls. */
class TokenRepo {
    constructor (context: Promise<CrocContext>) {
        this.tokenViews = new Map<string, CrocTokenView>()
        this.context = context
    }

    materialize (tokenAddr: string): CrocTokenView {
        let tokenView = this.tokenViews.get(tokenAddr)
        if (!tokenView) {
            tokenView = new CrocTokenView(this.context, tokenAddr)
            this.tokenViews.set(tokenAddr, tokenView)
        }
        return tokenView
    }

    tokenViews: Map<string, CrocTokenView>
    context: Promise<CrocContext>
}