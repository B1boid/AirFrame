import {Activity} from "../../classes/module";
import {LineaActivity} from "../blockchain_modules";
import {lineaSwapEthToWst_swap} from "./interations";

export const lineaSwapEthToWst: Activity = {
    name: LineaActivity.lineaSwapEthToWst,
    txs: [
        lineaSwapEthToWst_swap
    ]
}
