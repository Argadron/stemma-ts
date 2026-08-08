import type { Subscriber } from "@interfaces";

/**
 * Dynamic allows you to create mutable values
 * @example
 * const dynamic = new Dynamic<number>({
 *  next: (v) => console.log,
 *  error: (v) => console.error,
 *  completed: (v) => console.log(`Completed as value: ${v}`)
 * }, 1)
 * 
 * dynamic.mutate(2) // sync mutation
 * 
 * await console.log(dynamic.read()) // 2
 * 
 * void dynamic.mutateAsync(new Promise(resolve => resolve(5))) // async mutation
 * dynamic.mutate(3) // will be waiting async mutation
 * dynamic.complete() // complete dynamic value, or 
 * dynamic.mutate(1, true) // set flag completed
 * dynamic.error('error') // create a error
 */
export class Dynamic<T = any> {
    private activeMutation = false;
    private subs = new Set<(v: T) => T | Promise<T>>()
    private isCompleted = false;
    private currentValue: T | undefined;
    
    private readonly observers = new Set<Subscriber<T>>();

    private tryComplete(v?: T) {
        if (!this.isCompleted) {
            this.isCompleted = true
            this.currentValue = v
            this.observers.forEach(subscriber => subscriber.completed(this.currentValue))
        }
    }

    public constructor(subscriber?: Subscriber<T>, initialValue?: T) {
        this.currentValue = initialValue
        
        if (subscriber) this.observers.add(subscriber)
    }

    public mutate(v: T, final=false) {
        if (this.isCompleted) return;

        try {
            if (this.activeMutation) {
                this.subs.add(() => {
                    if (final) this.tryComplete(v)
                    else {
                        this.currentValue = v
                        this.observers.forEach(subscriber => subscriber.next(v))
                    }

                    return v
                })
            }
            else {
                this.currentValue = v
                this.observers.forEach(subscriber => subscriber.next(v))
            }
        } catch (error) {
            this.observers.forEach(subscriber => subscriber.error ? subscriber.error(error) : null)
        }
    }

    public async mutateAsync(v: Promise<T>, final=false, signal?: AbortSignal) {
        if (this.isCompleted) return;

        let abortHandler: ((e: Event) => void) | undefined;

        try {
            if (!this.activeMutation) {
                this.activeMutation = true
                
                const result = await Promise.race([
                    v,
                    new Promise<never>((_, reject) => {
                        if (signal) {
                            if (signal.aborted) {
                                this.activeMutation = false
                                
                                reject(signal.reason)
                            }

                            abortHandler = () => {
                                this.activeMutation = false

                                reject(signal.reason)
                            }

                            signal.addEventListener('abort', abortHandler)
                        }
                    })
                ])

                if (signal && abortHandler) signal.removeEventListener('abort', abortHandler)

                this.currentValue = result

                if (final) this.tryComplete(result)
                else this.observers.forEach(subscriber => subscriber.next(result))

                while (this.subs.size !== 0) {
                    const queue = Array.from(this.subs)

                    this.subs.clear()

                    let newValue: T = this.currentValue

                    for (const cb of queue) newValue = await cb(newValue)

                    this.currentValue = newValue
                }

                this.activeMutation = false
            }
            else this.subs.add(async (newValue) => {
                let internalAbortHandler: VoidFunction | undefined;

                try {
                    const result = await Promise.race([
                        v,
                        new Promise<never>((_, reject) => {
                            if (signal) {
                                if (signal.aborted) return reject(signal.reason)
                                else {
                                    internalAbortHandler = () => reject(signal.reason)

                                    signal.addEventListener('abort', internalAbortHandler)
                                }
                            }
                        })
                    ])

                    if (final) this.tryComplete(result)
                    else this.observers.forEach(subscriber => subscriber.next(result))
                    
                    return result
                } catch(error) {
                    this.observers.forEach(subscriber => subscriber.error?.(error))

                    return this.currentValue ?? newValue
                } finally {
                    if (signal && internalAbortHandler) signal.removeEventListener('abort', internalAbortHandler)
                }
            })
        } catch (error) {
            this.activeMutation = false
            this.observers.forEach(subscriber => subscriber.error ? subscriber.error(error) : null)
        } finally {
            if (signal && abortHandler) signal.removeEventListener('abort', abortHandler)
        }
    }

    public async read(): Promise<T | undefined> {
        if (!this.activeMutation) return this.currentValue
        else return new Promise((resolve) => this.subs.add((v: T) => {
            resolve(v)

            return v
        }))
    }

    public complete(v?: T) {
        if (!this.activeMutation) return this.tryComplete(v)
        else this.subs.add((newValue) => {
            this.tryComplete(v)

            return v ?? newValue
        })
    }

    public error(reason?: any) {
        this.observers.forEach(subscriber => {
            if (subscriber.error) {
                subscriber.error(reason)

                return true
            }
            else return false
        })
    }

    public destroy() {
        this.isCompleted = true
        this.subs.clear()
        this.observers.clear()
        this.currentValue = undefined
        this.activeMutation = false
    }

    public subscribe(sub: Subscriber<T>) {
        this.observers.add(sub)

        return () => this.observers.delete(sub)
    }

    public unSubscribe(sub: Subscriber<T>) {
        return this.observers.delete(sub)
    }

    public async transform<Mutation extends T>(fn: (value: T | undefined) => Mutation | Promise<Mutation>) {
        const value = await this.read()
        const mutatedValue = await fn(value)

        this.mutate(mutatedValue)

        return mutatedValue
    }
}