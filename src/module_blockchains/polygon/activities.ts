import {Activity} from "../../classes/module";
import {
    polygonWrapUnwrap_wrap,
    polygonWrapUnwrap_unwrap,
    polygonSwapCycleNativeToUsdc_swapto, polygonSwapCycleNativeToUsdc_swapback
} from "./interations";
import {PolygonActivity} from "../blockchain_modules";


export const polygonWrapUnwrap: Activity = {
    name: PolygonActivity.wrapUnwrap,
    txs: [
        polygonWrapUnwrap_wrap, polygonWrapUnwrap_unwrap
    ]
}

export const polygonSwapCycleNativeToUsdc: Activity = {
    name: PolygonActivity.polygonSwapCycleNativeToUsdc,
    txs: [
        polygonSwapCycleNativeToUsdc_swapto,
        polygonSwapCycleNativeToUsdc_swapback
    ]
}
