import js           from '@eslint/js'
import reactHooks   from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals      from 'globals'

export default [
 
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  
  js.configs.recommended,

  {
    files: ['src/**/*.{js,jsx}'],

    plugins: {
      'react-hooks':   reactHooks,
      'react-refresh': reactRefresh,
    },

    languageOptions: {
      ecmaVersion: 2022,
      sourceType:  'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      // React Hooks 
      'react-hooks/rules-of-hooks':  'error',   // hooks called at top level only
      'react-hooks/exhaustive-deps': 'warn',    // missing useEffect deps flagged

      // React Refresh (Vite HMR)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Variables 
      'no-unused-vars': ['warn', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',   // allow _intentionallyUnused
        argsIgnorePattern: '^_',
      }],
      'no-undef':          'error',
      'no-var':            'error',
      'prefer-const':      'warn',

      // Timing-critical code guards 
      // setInterval in task loops causes drift, all scheduling must go 
      // through precisionTimer.js Flag bare setInterval use
      'no-restricted-syntax': [
        'warn',
        {
          selector: "CallExpression[callee.name='setInterval']",
          message:  'Prefer precisionTimer.js runSchedule() over setInterval() for trial scheduling.',
        },
      ],
      
      'no-console':          ['warn', { allow: ['warn', 'error'] }],
      'no-debugger':         'error',
      'eqeqeq':              ['error', 'always', { null: 'ignore' }],
      'no-duplicate-imports':'error',
      'no-throw-literal':    'error',
    },
  },

  {
    files: ['src/**/__tests__/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        describe: 'readonly',
        it:       'readonly',
        expect:   'readonly',
        beforeEach: 'readonly',
        afterEach:  'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console':     'off',
    },
  },
]
