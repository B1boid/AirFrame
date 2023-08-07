export const OKX_BASE_URL = "https://www.okx.com"
export enum Method {
    GET = "GET",
    POST = "POST"
}

export enum OKXApiMethod {
    OKX_GET_DEPOSIT_ADDRESSES = "/api/v5/asset/deposit-address",
    OKX_TRANSFER = "/api/v5/asset/transfer",
    OKX_WITHDRAWAL = "/api/v5/asset/withdrawal",
    OKX_MAIN_BALANCE = "/api/v5/asset/balances",
    OKX_SUB_BALANCE = "/api/v5/asset/subaccount/balances",
    OKX_DEPOSIT_WITHDRAW_STATUS = "/api/v5/asset/deposit-withdraw-status"
}

export enum OKXTransferType {
    FROM_MASTER_TO_SUB = "1",
    FROM_SUB_TO_MASTER = "2"
}

export interface OKXDepositAddress {
    addr: string,
    tag: string,
    memo: string,
    pmtId: string,
    addrEx: object,
    ccy: string,
    chain: string,
    to: string,
    selected: boolean,
    ctAddr: string
}
export interface OKXGetDepositAddressesResponse {
    code: string,
    data: [OKXDepositAddress]
}

export interface OKXTransferData {
    transId: string,
    clientId: string,
    ccy: string,
    from: string,
    amt: string,
    to: string
}
export interface OKXTransferResponse {
    code: string,
    msg: string,
    data: [OKXTransferData]
}

export interface OKXWithdrawalData {
    ccy: string,
    chain: string,
    amt: string,
    wdId: string,
    clientId: string
}
export interface OKXWithdrawalResponse {
    code: string,
    msg: string,
    data: [OKXWithdrawalData]
}

export interface OKXGetBalance {
    ccy: string,
    bal: string,
    frozenBal: string,
    availBal: string
}
export interface OKXGetBalanceResponse {
    code: string,
    msg: string,
    data: [OKXGetBalance]
}


export interface OKXGetDepositWithdrawalStatus {
    estCompleteTime: string,
    state: string,
    txId: string,
    wdId: string
}

export interface OKXGetDepositWithdrawalStatusResponse {
    code: string,
    msg: string,
    data: [OKXGetDepositWithdrawalStatus]
}

