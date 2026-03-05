import { 
    type IPlugin, 
    OnEvent, 
    Game, 
    createGame,
    CommandType,
    USE_VALIDATION_EVENT_PREFIX, 
    useValidation,
    Entity
} from "stemma-ts";

/**
 * LEVEL SENIOR: "Architectural Integrity"
 * In this level we doesnt control object, we control RULES of them iteract
 */
export class CoreRulesPlugin implements IPlugin {
    public readonly name = 'CORE_RULES_PLUGIN'

    /**
     * Method install — its place, where Senior set settings in core
     */
    public install(game: Game) {
        console.log(`[KERNEL] Implementing Global Intent Validation...`)

        /**
         * 1.Intent Validation
         */
        const attackValidationKey = `${USE_VALIDATION_EVENT_PREFIX}:${CommandType.ATTACK}`
        
        game.registerCustomEvent<any>(attackValidationKey, (opts, event, data) => {
            const attacker = data.entity! as Entity
            const target = data.eventData.entities[0]

            // Rule: You cant attack friends (Friendly Fire Check)
            if (attacker.hasTag('team_a') && target.hasTag('team_a')) {
                data.eventData.isAllowed = false // БBlock this action
                data.eventData.errors.push('CRITICAL_ERROR:FRIENDLY_FIRE_PROTOCOL')
            }

            // Rule: stunned cant attack
            if (attacker.hasTag('stunned')) {
                data.eventData.isAllowed = false
                data.eventData.errors.push('ACTION_DENIED:ENTITY_STUNNED')
            }
        });

        return true
    }

    /**
     * 2.Global Side Effects
     */
    @OnEvent('entityDead')
    public onGlobalDeath({ options, event, data }: any) {
        const victim = data.entity;
        
        console.log(`[GRAVEYARD] Entity ${victim.id} died. Clearing status...`);
        
        // Clear all relationships
        victim.addTag('dead')

        // Example: send world signal to all plugins, etc.
        game.processCustomEvent('world_signal:death', { 
            eventData: {
                position: victim.position,
                level: victim.level 
            },
            eventTime: game.currentTick
        })
    }
}

// --- SYSTEM INIT ---

const [game, manager] = createGame()

// Register this plugin first
// Now any Junior-scripts will be controlled by this rules
game.registerPlugin(new CoreRulesPlugin())

// Example create not correct scenario
const soldier1 = manager.create({ name: 'Soldier_A1', position: [5, 5], damage: 10, health: 10, isDead: false })
const soldier2 = manager.create({ name: 'Soldier_A2', position: [6, 5], damage: 10, health: 10, isDead: false })

soldier1.addTag('team_a')
soldier2.addTag('team_a')

// This try return error
const { isAllowed, errors } = useValidation(game, soldier1, CommandType.ATTACK, { entities: [soldier2] })
if (!isAllowed) {
    console.log(`[UI] Action blocked: ${errors}`)
}
