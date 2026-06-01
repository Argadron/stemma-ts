import type { Game } from "@core";
import type { Question, QuestionBlock } from "@types";

/**
 * Ask game for specify Question
 * @param question - Question, can be asked as true or false
 * @param core - Game reference, if hydration disabled
 * @returns { boolean } - Answer from game to question
 */
export function useQuestion<T extends number = 1>(question: Question<T>, core?: Game): boolean {
    const { options } = useQuestion.prototype.game as Game || core
    const manager = options.manager
    const map = options.map

    function isOnePartTrue(part: QuestionBlock): boolean {
        const questionParts = part[0] === ':' ? part.slice(1).split(":") : part.split(':')
        const id = parseInt(questionParts[1]!)
        const isEntityCheck = questionParts[0] === 'E'

        const liveCheck = (id: number, type:'L'|'D') => 
            isEntityCheck ? 
                type === 'D' ? (manager.get(id)?.isDead || false) :
                !(manager.get(id)?.isDead)
                : false

        switch (questionParts[2]) {
            case 'L':
                return liveCheck(id, 'L')
            case 'D':
                return liveCheck(id, 'D')
            case 'O':
                return isEntityCheck ? manager.checkEntityOk(id) : map.checkObjectOk(id)
            default:
                return false
        }
    }

    if (!/[+*]/.test(question)) return isOnePartTrue(question as QuestionBlock)

    const conuictionsResults: boolean[] = []
    const isQuestionIncludesConuntions = question.includes('*')

    let isQuestionTrue = false;

    if (isQuestionIncludesConuntions) {
        const conuictions = question.split('*')

        for (const currentConuction of conuictions) {
            const disuctionsOfCurrentConuction = currentConuction.split('+')

            conuictionsResults.push(disuctionsOfCurrentConuction.map(disuctionBlock => isOnePartTrue(disuctionBlock as QuestionBlock)).some(value => value === true))
        }
    }
    if (conuictionsResults.length === 0) {
        const disuctions = question.split('+')

        isQuestionTrue = disuctions.map(disutionBlock => isOnePartTrue(disutionBlock as QuestionBlock)).some(value => value === true)
    }

    return ((conuictionsResults.every(result => result === true) && isQuestionIncludesConuntions) || isQuestionTrue)
}