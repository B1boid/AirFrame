export const OKX_BASE_URL = "https://www.okx.com"

export const OKX_GET_DEPOSIT_ADDRESSES = "/api/v5/asset/deposit-address"
export const OKX_GET_DEPOSIT_ADDRESSES_URL = `${OKX_BASE_URL}${OKX_GET_DEPOSIT_ADDRESSES}?`

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