import { BASE_HISTORY_LIMIT } from "@const";
import type { ISnapshot, IUndoManager, IUndoManagerOptions } from "@interfaces";

export class UndoManager implements IUndoManager {
    private redoStack: ISnapshot[] = [];
    
    private readonly historyLimit: number;
    private readonly options: IUndoManagerOptions;
    private readonly undoStack: ISnapshot[] = [];

    public constructor(options: IUndoManagerOptions) {
        this.options = options
        this.historyLimit = options.historyLimit ?? BASE_HISTORY_LIMIT
    }

    public push(snapshot: ISnapshot) {
        if ((this.undoStack.length + 1) > this.historyLimit) this.undoStack.shift()
        
        this.undoStack.push(snapshot)
        this.redoStack = []
    }

    public undo() {
        const snapshot = this.undoStack.pop()

        if (!snapshot) return
        
        this.redoStack.push(this.options.game.save())
        this.options.game.load(snapshot)
    }

    public redo() {
        const snapshot = this.redoStack.pop()

        if (!snapshot) return

        this.undoStack.push(this.options.game.save())
        this.options.game.load(snapshot)
    }
}