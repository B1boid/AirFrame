import {Activity} from "../../classes/module";
import {ScrollActivity} from "../blockchain_modules";
import {scrollRandomApprove_approve, scrollRandomStuff_do} from "./interations";




export const scrollRandomApprove: Activity = {
    name: ScrollActivity.scrollRandomApprove,
    txs: [
        scrollRandomApprove_approve
    ]
}

export const scrollRandomStuff: Activity = {
    name: ScrollActivity.scrollRandomStuff,
    txs: [
        scrollRandomStuff_do
    ]
}
