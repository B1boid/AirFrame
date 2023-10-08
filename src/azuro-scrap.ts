import {AzuroBet} from "./classes/azuro-classes";
import {checkUsdtBalance, scrap} from "./utils/azuro-utils";


//new-1 0x66d64b69D73Ea9AcB468C267b4CE5d513A41276c
// arb-2 0x9Ea81A9246d31E9c64C50456de1C948CdE40d62C
// arb-3 0x15add8564A1D66c43Ff576f5490b0483469FADA4
// soljst 0xc1679Cc46E155D415D4CCB2FA7953C5d1e09Cc50

export const ALL_BETS: { [key: string]: AzuroBet[] } = {
    "0x9Ea81A9246d31E9c64C50456de1C948CdE40d62C": [
        // {
        //     odd: 7.559528967559,
        //     amount: 66,
        //     condId: "100100000000000015795145750000000000000252773059",
        //     outcomeId: "29"
        // }
    ],
    "0x66d64b69D73Ea9AcB468C267b4CE5d513A41276c": [
        // {
        //     odd: 5.602226051501,
        //     amount: 89,
        //     condId: "100100000000000015795145750000000000000252773059",
        //     outcomeId: "30"
        // },
        // {
        //     odd: 1.403735469363,
        //     amount: 353,
        //     condId: "100100000000000015795145750000000000000252773059",
        //     outcomeId: "31"
        // }
        // {
        //     odd: 1.929938419581,
        //     amount: 309,
        //     condId: "100100000000000015795145730000000000000250792663",
        //     outcomeId: "29"
        // }
    ],
    "0x15add8564A1D66c43Ff576f5490b0483469FADA4": [
        // {
        //     odd: 1.625564589301,
        //     amount: 305,
        //     condId: "100100000000000015795135590000000000000252772921",
        //     outcomeId: "29"
        // },
        // {
        //     odd:  3.470914214984,
        //     amount: 172,
        //     condId: "100100000000000015795145730000000000000250792663",
        //     outcomeId: "30"
        // }
    ],
    "0xc1679Cc46E155D415D4CCB2FA7953C5d1e09Cc50": [
        // {
        //     odd: 4.789544071619,
        //     amount: 85,
        //     condId: "100100000000000015795135590000000000000252772921",
        //     outcomeId: "31"
        // },
        // {
        //     odd: 4.014888122183,
        //     amount: 117,
        //     condId: "100100000000000015795135590000000000000252772921",
        //     outcomeId: "30"
        // },
        // {
        //     odd: 4.738333885842,
        //     amount: 129,
        //     condId: "100100000000000015795145730000000000000250792663",
        //     outcomeId: "31"
        // }
    ]
}

async function task() {
    let addrs = [
        "0x66d64b69D73Ea9AcB468C267b4CE5d513A41276c",
        "0x9Ea81A9246d31E9c64C50456de1C948CdE40d62C",
        "0x15add8564A1D66c43Ff576f5490b0483469FADA4",
        "0xc1679Cc46E155D415D4CCB2FA7953C5d1e09Cc50"
    ]
    await checkUsdtBalance(addrs)
    scrap(600)
}
// task()
