export default {
    testMatch: [
        "<rootDir>/tests/**/*.ts", 
        "**/?(*.)+(spec|test).ts"
    ],
    preset: 'ts-jest',
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@$': '<rootDir>/src/index.ts',
    '^@enums$': '<rootDir>/src/enums/index.ts',
    '^@interfaces$': '<rootDir>/src/interfaces/index.ts',
    '^@world$': '<rootDir>/src/world/index.ts',
    '^@utils$': '<rootDir>/src/utils/index.ts',
    '^@types$': '<rootDir>/src/types/index.ts',
    '^@const$': '<rootDir>/src/const/index.ts',
    '^@factories$': '<rootDir>/src/factories/index.ts',
    '^@store$': '<rootDir>/src/store/index.ts',
    '^@middlewares$': '<rootDir>/src/middlewares/index.ts',
    '^@plugins$': '<rootDir>/src/plugins/index.ts',
    '^@decorators$': '<rootDir>/src/decorators/index.ts',
    },
    transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'node',
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          esModuleInterop: true,
          allowJs: true
        }
      }
    ]
  },
}