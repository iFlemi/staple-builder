import { defineConfig } from 'vitest/config'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        includeSource: ['src/**/*.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.localTest.ts'],
        globals: true,
        passWithNoTests: true,
        silent: false,
        reporters: [
            [
                "default",
                {
                    summary: false
                }
            ]
        ],
        outputFile: {
            junit: './TestResult.xml'
        },
        coverage: {
            reporter: ['cobertura', 'text'],
            provider: 'istanbul',
            exclude: [
                'src/mocks/*',
                'src/vite-env.d.ts'
            ]
        }
    }
})
