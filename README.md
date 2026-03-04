# 🌿 stemma-ts
> **High-Performance Headless Game Engine**  
> *Реактивная топология и детерминированная логика игровых миров.*

`stemma-ts` — это сверхлегкое ядро (Kernel) для создания сложных игровых систем. Движок фокусируется на **валидации намерений**, **реактивном доступе к данным** и **пространственной оптимизации**.

---

## 🛠 Ключевые принципы

- **📦 Zero Dependencies:** 0 внешних зависимостей. Чистый TypeScript. Работает везде: Node.js, Browser, Bun, Deno.
- **⚡ Spatial Grid ($O(1)$):** Собственная реализация пространственной сетки для мгновенного поиска объектов.
- **🔄 Reactive LiveQueries:** Индексация сущностей в реальном времени. Данные сами «притекают» в системы при смене тегов.
- **🛡 Intent Validation:** Система предварительной проверки действий (Hooks), исключающая логические баги до их исполнения.
- **💾 Deterministic Snapshots:** Полная сериализация состояния мира для сохранений, реплеев и сетевой синхронизации.

---

## 📖 Уровни интеграции (Architecture Layers)

Движок адаптируется под уровень компетенций разработчика, предлагая разные инструменты для решения задач.

### 🟢 Junior: Imperative Scripting
Использование движка как библиотеки инструментов. Прямое управление объектами и ручная проверка условий.

```typescript
// Создаем сущность и отдаем приказы напрямую
const hero = manager.create({ name: 'Hero', position: [5, 5] });

game.on('entityMoved', (o, e, d) => {
    console.log('Герой сдвинулся!');
});

hero.move([6, 5]);
hero.pickUp();
```

### 🟡 Middle: Declarative Reactivity
На этом уровне разработчик перестает писать ручные циклы фильтрации. Благодаря **LiveQueries**, движок сам поддерживает актуальные списки сущностей, реагируя на изменение их состояния или тегов.

```typescript
class ZombieAISystem implements IPlugin {
    // Движок автоматически наполняет этот Set и удаляет из него сущности,
    // как только они получают тег 'dead' или 'frozen'.
    @InjectLiveQuery({ 
        all: ['zombie'], 
        none: ['dead', 'frozen'],
        where: (e) => e.health > 50 
    })
    private activeZombies!: Set<Entity>;

    @OnTick(20) // Оптимизированный цикл: выполняется раз в 20 тиков
    update(game: Game) {
        // Никаких .filter() или .find() — данные уже готовы и актуальны.
        this.activeZombies.forEach(zombie => zombie.think());
    }
}
```

### 🔴 Senior: Architectural Design (Мета-программирование)
На этом уровне разработчик проектирует **протоколы взаимодействия**. Он не пишет «код для зомби», он создает **системные фильтры**, которые гарантируют соблюдение правил игры во всех плагинах сразу.

```typescript
/**
 * Senior-разработчик внедряет глобальное правило: "Оглушенные не могут использовать предметы".
 * Это правило применится ко всем плагинам, написанным Junior и Middle разработчиками.
 */
game.registerCustomEvent(`${USE_VALIDATION_EVENT_PREFIX}:${CommandType.USE_ITEM}`, (opts, event, data) => {
    const { entity } = data.eventData;
    
    // Если на сущности висит тег 'stunned', мы блокируем любое "намерение" использовать предмет
    if (entity!.hasTag('stunned')) {
        data.eventData.isAllowed = false;
        data.eventData.errors.push('ACTION_BLOCKED_BY_STUN');
    }
});

/**
 * Использование высокоуровневых системных хуков для сложных вычислений.
 * Пример: Проверка видимости с учетом тумана войны или кустов.
 */
const { isVisible, factor } = useVisibility(game, zombie, player);

if (isVisible && factor > 0.5) {
    // Зомби видит игрока отчетливо — можно атаковать
    zombie.attack();
}
```
