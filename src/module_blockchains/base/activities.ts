import {Activity} from "../../classes/module";
import {BaseActivity} from "../blockchain_modules";
import {baseWrapUnwrap_unwrap, baseWrapUnwrap_wrap} from "./interations";

export const baseWrapUnwrap: Activity = {
    name: BaseActivity.wrapUnwrap,
    txs: [
        baseWrapUnwrap_wrap,
        baseWrapUnwrap_unwrap
    ]
}
