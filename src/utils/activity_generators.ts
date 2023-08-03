import {Activity, ActivityTx, WrappedActivity} from "../classes/module";
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

function noRandomness(activities: WrappedActivity[]): ActivityTx[] {
    let res: ActivityTx[] = []
    for (const activity of activities) {
        for (const tx of activity.activity.txs) {
            res.push(new ActivityTx(activity.activity.name + activity.id.toString(), tx))
        }
    }
    return res
}

function onlyActivities(activities: WrappedActivity[]): ActivityTx[] {
    let res: ActivityTx[] = []
    const shuffledActivities = shuffle(activities)
    for (const activity of shuffledActivities) {
        for (const tx of activity.activity.txs) {
            res.push(new ActivityTx(activity.activity.name + activity.id.toString(), tx))
        }
    }
    return res
}

function fullShuffleActivities(activities: WrappedActivity[]): ActivityTx[]{
    let res: ActivityTx[] = []
    while (true){
        let added = false
        const shuffledActivities = shuffle(activities)
        for (const activity of shuffledActivities) {
            if (activity.activity.txs.length > 0){
                res.push(new ActivityTx(activity.activity.name + activity.id.toString(), activity.activity.txs.shift()!))
                added = true
                break
            }
        }
        if (!added) break
    }
    return res
}

function addIdToActivities(activities: Activity[]): WrappedActivity[]{
    let ids: {[id: string]: number} = {}
    let newActivities: WrappedActivity[] = []
    for (let activity of activities){
        if (ids[activity.name] === undefined){
            ids[activity.name] = 0
        }
        newActivities.push({activity: activity, id: ++ids[activity.name]})

    }
    return newActivities
}

export function getActivitiesGenerator(_activities: Activity[], randomness: Randomness): ActivityTx[] {
    let activities: WrappedActivity[] = addIdToActivities(_activities)
    switch (randomness) {
        case Randomness.No:
            return noRandomness(activities)
        case Randomness.OnlyActivities:
            return onlyActivities(activities)
        case Randomness.Full:
            return fullShuffleActivities(activities)
    }
}