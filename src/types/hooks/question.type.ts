/**
 * Question operators, where
 * L - Alive (not dead),
 * D - Dead
 * O - OK (map.checkObjectOk or manager.checkOk())
 */
export type QuestionOperator = 'L' | 'D' | 'O'

/**
 * Question logic operator provided 0+0, 0+1, 1+0, 1+1, 0*0... binary logic
 * Works with boolean convert into 1/0 numbers
 */
export type QuestionLogicOperator = '+' | '*'

/**
 * End operator for all question
 */
export type QuestionEndOperator = '~'

/**
 * One block of question
 */
export type QuestionBlock = `${'E'|'O'}:${number}:${QuestionOperator}`

type BuildChainArray<
    Length extends number, 
    CountArray extends QuestionBlock[] = []
> = CountArray['length'] extends Length
    ? CountArray
    : BuildChainArray<Length, [...CountArray, QuestionBlock]>;
type JoinChain<T extends any[]> = 
    T extends [infer Head extends string, ...infer Tail]
        ? Tail['length'] extends 0
            ? Head
            : `${Head}:${QuestionLogicOperator}:${JoinChain<Tail>}`
        : never;

/**
 * Question type, where number is ID of WO (World object, Entity | GameObject)
 * @example
 * const question: Question = `E:56:L:~` // Entity with id 56 must be live for true
 * const questionTwo: Question<2> = `O:1:O:*:E:2:D` // Object with id must be ok AND entity with id 2 must be dead
 * 
 * useQuestion(question) // true if entity with id 56 live
 */
export type Question<N extends number = 1> = `${JoinChain<BuildChainArray<N>>}:${QuestionEndOperator}`;