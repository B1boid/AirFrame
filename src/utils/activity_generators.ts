import {Activity, ActivityTx, TxInteraction} from "../classes/module";
import {Randomness} from "../classes/actions";
import {WalletI} from "../classes/wallet";

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

function* noRandomness(activities: Activity[]) {
    for (const activity of activities) {
        for (const tx of activity.txs) {
            yield new ActivityTx(activity.name, tx)
        }
    }
}

function* onlyActivities(activities: Activity[]) {
    const shuffledActivities = shuffle(activities)
    for (const activity of shuffledActivities) {
        for (const tx of activity.txs) {
            yield new ActivityTx(activity.name, tx)
        }
    }
}

function* fullShuffleActivities(activities: Activity[]) {
    while (activities.length > 0) {
        const idx = Math.floor(Math.random() * activities.length)
        const activity = activities[idx];
        const tx = activity.txs.shift()!
        if (activity.txs.length == 0) {
            activities = activities.splice(idx, 1)
        }
        yield new ActivityTx(activity.name, tx)
    }
}

export function getActivitiesGenerator(activities: Activity[], randomness: Randomness) {
    switch (randomness) {
        case Randomness.No:
            return noRandomness(activities)
        case Randomness.OnlyActivities:
            return onlyActivities(activities)
        case Randomness.Full:
            return fullShuffleActivities(activities)
    }
}