module.exports = {
    root: true, // don't look any higher in filesystem for eslint config
    noInlineConfig: true, // don't allow comments in source files to suppress eslint comments
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json'],
    },
    plugins: [
      '@typescript-eslint',

      'jsdoc', // using eslint-plugin-jsdoc in preference to eslint-plugin-tsdoc, because tsdoc is too rigid
               // (e.g. it assumes the doc comment is HTML instead of markdown, and warns about < and <=)
    ],

    // start with some base recommended rules
    extends: [
      'eslint:recommended',
        // descriptions of rules at https://eslint.org/docs/rules/
        //   all these rules have 'error' severity, see https://github.com/eslint/eslint/blob/master/conf/eslint-recommended.js

      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
        // descriptions of rules at https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
        //    some rules have 'warn' and some 'error' severity, see:
        //       https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/recommended.ts
        //       https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/eslint-recommended.ts

      'plugin:jsdoc/recommended',
        // descriptions of rules at https://github.com/gajus/eslint-plugin-jsdoc#eslint-plugin-jsdoc-rules
        // recommended rules at https://github.com/gajus/eslint-plugin-jsdoc#eslint-plugin-jsdoc-configuration 
    ],

    // and configure them a bit for 6.102
    rules: {
      // in the config below,
      //    error means that Caesar will show a comment marked #important
      //    warn means that Caesar will show a comment, but without #important
      //    off means eslint and Caesar won't report the issue

      // turn on these rules (to mimic our Java Checkstyle configuration)
      'no-tabs': 'error',
      'max-lines': ['warn', 2000],
      'max-params': ['warn', 7],
      'max-lines-per-function': ['warn', 150],
      'max-depth': ['warn', 4],
      'no-warning-comments': 'warn', // catches TODO
      'semi': 'error', // require semicolons ending statements
      '@typescript-eslint/naming-convention': [
          'error', 
          // allow UPPER_CASE enum members:
          {
            selector: 'enumMember',
            format: ['UPPER_CASE', 'camelCase', 'PascalCase']
          },
          // ... and the rest is just restating the naming-convention defaults (which is necessary,
          // because overriding this option erases the default naming convention rules and replaces them with these rules)
          {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },

          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },

          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
      ],

      // extra TS requirements
      '@typescript-eslint/explicit-function-return-type': [ 'error', { allowExpressions: true } ],
      '@typescript-eslint/explicit-member-accessibility': 'error',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // configure jsdoc plugin to match the loose way we use TypeDoc
      'jsdoc/no-types': 'error', // forbid types in @param, because they're redundant with TS declaration
      'jsdoc/require-param-type': 'off', // ditto
      'jsdoc/require-returns-type': 'off', // ditto
      'jsdoc/tag-lines': 'off', // too picky about spacing

      // turn off these recommended rules
      'no-constant-condition': 'off', // so that we can say "while (true) {...}" without error
      '@typescript-eslint/no-unused-vars': 'off', // TS compiler already shows this warning
      '@typescript-eslint/restrict-plus-operands': 'off', // template literals are good but we don't introduce them right away
      '@typescript-eslint/restrict-template-expressions': 'off', // template literals should be allowed to have non-string fields
      '@typescript-eslint/require-await': 'off', // async functions should be allowed to have no awaits in them
      
      // configure magic numbers a bit
      'no-magic-numbers': ['error', { ignore: [0,1,2,-1,-2] } ],

      // don't allow typecasts: no "<T>expr", no "expr as <T>"
      '@typescript-eslint/consistent-type-assertions': [ 'error', { assertionStyle: 'never' }],
    },
    overrides: [
      { // turn off magic-number checking in tests
        files: [ '**/test/**' ],
        rules: {
          'no-magic-numbers': 'off',   
        },
      },
    ],
};
