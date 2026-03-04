# 🌿 stemma-ts
> **High-Performance Headless Game Engine**  
> *Reactive topology and deterministic logic for game worlds.*

`stemma-ts` is an ultra-lightweight Kernel designed for building complex game systems. The engine focuses on **intent validation**, **reactive data access**, and **spatial optimization**.

---

## 🛠 Core Principles

- **📦 Zero Dependencies:** 0 external dependencies. Pure TypeScript. Works everywhere: Node.js, Browser, Bun, Deno.
- **⚡ Spatial Grid ($O(1)$):** Custom spatial partitioning for instantaneous object lookups.
- **🔄 Reactive LiveQueries:** Real-time entity indexing. Data "flows" into your systems as tags or states change.
- **🛡 Intent Validation:** A pre-execution hook system (Intents) that eliminates logical bugs before they happen.
- **💾 Deterministic Snapshots:** Full world state serialization for saves, replays, and network synchronization.

---

## 📖 Integration Layers

The engine scales with the developer's expertise, offering different tools for different tasks.

### 🟢 Junior: Imperative Scripting
Using the engine as a utility library. Direct object manipulation and manual condition checks.

```typescript
// Create an entity and issue orders directly
const hero = manager.create({ name: 'Hero', position: [5, 5] });

game.on('entityMoved', (o, e, d) => {
    console.log('Hero moved!');
});

hero.move([6, 5]);
hero.pickUp();
```

### 🟡 Middle: Declarative Reactivity
At this level, developers stop writing manual filter loops. Using **LiveQueries**, the engine automatically maintains up-to-date entity lists, reacting to tag changes or state updates in real-time.

```typescript
class ZombieAISystem implements IPlugin {
    // The engine automatically populates and clears this Set 
    // as entities gain or lose 'dead' or 'frozen' tags.
    @InjectLiveQuery({ 
        all: ['zombie'], 
        none: ['dead', 'frozen'],
        where: (e) => e.health > 50 
    })
    private activeZombies!: Set<Entity>;

    @OnTick(20) // Optimized cycle: runs every 20 ticks
    update(game: Game) {
        // No .filter() or .find() overhead — data is ready and reactive.
        this.activeZombies.forEach(zombie => zombie.think());
    }
}
```

### 🔴 Senior: Architectural Design (Meta-Programming)
At this level, developers design **interaction protocols**. Instead of "zombie code," they create **systemic filters** that enforce world rules across all plugins, ensuring architectural integrity.

```typescript
/**
 * A Senior developer implements a global rule: "Stunned units cannot use items."
 * This rule automatically applies to all code written by Junior and Middle developers.
 */
game.registerCustomEvent(`${USE_VALIDATION_EVENT_PREFIX}:${CommandType.USE_ITEM}`, (opts, event, data) => {
    const { entity } = data.eventData;
    
    // If the entity has the 'stunned' tag, we block any "intent" to use an item at the core level
    if (entity!.hasTag('stunned')) {
        data.eventData.isAllowed = false;
        data.eventData.errors.push('ACTION_BLOCKED_BY_STUN');
    }
});

/**
 * Utilizing high-level system hooks for complex calculations.
 * Example: Real-time Line-of-Sight (LoS) check considering fog of war or cover.
 */
const { isVisible, factor } = useVisibility(game, zombie, player);

if (isVisible && factor > 0.5) {
    // Zombie sees the player clearly — proceed with attack logic
    zombie.attack();
}
```