type Meal = {
    id: string,
    name: string,
    description: string | null,
    time: string | null,
    in_diet: boolean,
    session_id: string
}

export const calculateBestSequence = (mealsSequence: Meal[]) => {
    let currentSequence = 0;
    let bestSequence = currentSequence;

    for (let meal of mealsSequence) {
        if (meal.in_diet) {
            currentSequence++;
        } else {
            bestSequence = currentSequence > bestSequence ? currentSequence : bestSequence;
            currentSequence = 0;
        }
    }

    return bestSequence > currentSequence ? bestSequence : currentSequence;
}