import {Activity} from "../../classes/module";
import {polygonProject1_wrap} from "./interations";
import {PolygonActivity} from "../blockchain_modules";


export const polygonProject1: Activity = {
    name: PolygonActivity.Project1,
    txs: [
        polygonProject1_wrap
    ]
}
