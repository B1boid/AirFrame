import {Activity, ActivityTx} from "../classes/module";
import {Randomness} from "../classes/actions";

function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function noRandomness(activities: Activity[]): ActivityTx[] {
    let res: ActivityTx[] = []
    for (const activity of activities) {
        for (const tx of activity.txs) {
            res.push(new ActivityTx(activity.name, tx))
        }
    }
    return res
}

function onlyActivities(activities: Activity[]): ActivityTx[] {
    let res: ActivityTx[] = []
    const shuffledActivities = shuffle(activities)
    for (const activity of shuffledActivities) {
        for (const tx of activity.txs) {
            res.push(new ActivityTx(activity.name, tx))
        }
    }
    return res
}

function fullShuffleActivities(activities: Activity[]): ActivityTx[]{
    let res: ActivityTx[] = []
    while (true){
        let added = false
        const shuffledActivities = shuffle(activities)
        for (const activity of shuffledActivities) {
            if (activity.txs.length > 0){
                res.push(new ActivityTx(activity.name, activity.txs.shift()!))
                added = true
                break
            }
        }
        if (!added) break
    }
    return res
}

export function getActivitiesGenerator(activities: Activity[], randomness: Randomness): ActivityTx[] {
    switch (randomness) {
        case Randomness.No:
            return noRandomness(activities)
        case Randomness.OnlyActivities:
            return onlyActivities(activities)
        case Randomness.Full:
            return fullShuffleActivities(activities)
    }
}