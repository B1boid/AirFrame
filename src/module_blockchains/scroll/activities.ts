import {Activity} from "../../classes/module";
import {ScrollActivity} from "../blockchain_modules";
import {scrollRandomApprove_approve} from "./interations";




export const scrollRandomApprove: Activity = {
    name: ScrollActivity.scrollRandomApprove,
    txs: [
        scrollRandomApprove_approve
    ]
}
