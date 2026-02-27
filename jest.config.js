export default {
    testMatch: [
        "<rootDir>/tests/**/*.ts", 
        "**/?(*.)+(spec|test).ts"
    ],
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
    },
    transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isloatedModules: true
      },
    ],
  },
}