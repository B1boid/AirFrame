export const OKX_BASE_URL = "https://www.okx.com"
export enum Method {
    GET = "GET",
    POST = "POST"
}

export enum OKXApiMethod {
    OKX_GET_DEPOSIT_ADDRESSES = "/api/v5/asset/deposit-address",
    OKX_TRANSFER = "/api/v5/asset/transfer",
    OKX_WITHDRAWAL = "/api/v5/asset/withdrawal"
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

