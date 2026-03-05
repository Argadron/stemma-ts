/**
 * Register any decorator in any context
 * @param target - target or undefined
 * @param contextOrProperty - context or propert
 * @param data - data to decorator
 */
export function registerAnyDecorator<T = any>(target: any, contextOrProperty: string | any, decoratorKey: string, data: T, type: 'PROPERTY' | 'METHOD') {
    const readyData: any = {
        ...data
    }

    if (typeof contextOrProperty === 'string') {
        
        if (!target.__[decoratorKey]) target.__[decoratorKey] = []

        type === 'PROPERTY' ? readyData.propertyName = contextOrProperty : readyData.methodName = contextOrProperty

        target.__[decoratorKey].push(readyData)

        return;
    }
    else {
        
        contextOrProperty.addInitializer(function (this: any) {
            if (!this.__) this.__ = {}
            
            if (!this.__[decoratorKey]) this.__[decoratorKey] = []
            type === 'PROPERTY' ? readyData.propertyName = contextOrProperty.name : readyData.methodName = contextOrProperty.name

            this.__[decoratorKey].push(readyData)
        })
    }
}