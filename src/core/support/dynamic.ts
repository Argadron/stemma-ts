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
    private subs = new Set<Function>()
    private isCompleted = false;
    private currentValue: T | undefined;

    private tryComplete(v?: T) {
        if (!this.isCompleted) {
            this.isCompleted = true
            this.subscriber.completed(v)

            return true
        }
        else return false
    }

    public constructor(private readonly subscriber: Subscriber<T>, initialValue?: T) {
        this.currentValue = initialValue
    }

    public mutate(v: T, final=false) {
        try {
            if (this.activeMutation) {
                this.subs.add(() => {
                    if (final) {
                        if (!this.isCompleted) {
                            this.isCompleted = true
                            this.currentValue = v
                            this.subscriber.completed(v)
                        }
                    }
                    else {
                        this.currentValue = v
                        this.subscriber.next(v)
                    }
                })
            }
            else {
                this.currentValue = v
                this.subscriber.next(v)
            }
        } catch (error) {
            if (this.subscriber.error) this.subscriber.error(error)
        }
    }

    public async mutateAsync(v: Promise<T>, final=false, signal?: AbortSignal) {
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

                            signal.addEventListener('abort', (e) => {
                                this.activeMutation = false

                                reject(e)
                            })
                        }
                    })
                ])

                this.activeMutation = false
                this.currentValue = result

                if (final) this.tryComplete(result)
                else this.subscriber.next(result)
                if (this.subs.size !== 0) {
                    this.subs.forEach(cb => cb(result))
                    this.subs.clear()
                }
            }
        } catch (error) {
            this.activeMutation = false

            if (this.subscriber.error) this.subscriber.error(error)
        }
    }

    public async read(): Promise<T | undefined> {
        if (!this.activeMutation) return this.currentValue
        else return new Promise((resolve) => this.subs.add((v: T) => resolve(v)))
    }

    public complete(v?: T) {
        if (!this.activeMutation) return this.tryComplete(v)
        else this.subs.add(() => this.tryComplete(v))
    }

    public error(reason?: T) {
        if (this.subscriber.error) {
            this.subscriber.error(reason)

            return true
        }
        else return false
    }

    public destroy() {
        this.isCompleted = true
        this.subs.clear()
        this.currentValue = undefined
    }

    public async transform<Mutation extends T>(fn: (value: T | undefined) => Mutation | Promise<Mutation>) {
        const value = await this.read()
        const mutatedValue = await fn(value)

        this.mutate(mutatedValue)

        return mutatedValue
    }
}