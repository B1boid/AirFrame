import {Activity} from "../../classes/module";
import {polygonWrapUnwrap_wrap, polygonWrapUnwrap_unwrap} from "./interations";
import {PolygonActivity} from "../blockchain_modules";


export const polygonWrapUnwrap: Activity = {
    name: PolygonActivity.wrapUnwrap,
    txs: [
        polygonWrapUnwrap_wrap, polygonWrapUnwrap_unwrap
    ]
}
