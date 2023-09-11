import {Activity} from "../../classes/module";
import {BscActivity} from "../blockchain_modules";
import {bscKinzaCycle_deposit, bscKinzaCycle_withdraw, bscRandomApprove_approve} from "./interations";

export const bscRandomApprove: Activity = {
    name: BscActivity.bscRandomApprove,
    txs: [
        bscRandomApprove_approve
    ]
}
export const bscKinzaCycle: Activity = {
    name: BscActivity.bscKinzaCycle,
    txs: [
        bscKinzaCycle_deposit,
        bscKinzaCycle_withdraw
    ]
}

