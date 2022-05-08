module.exports = {
  plugins: ['vue', '@typescript-eslint'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    env: { es6: true },
    sourceType: 'module'
  },
  root: true,
  env: {
    browser: true,
    node: true,
    serviceworker: true
  },
  extends: [
    'plugin:vue/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/essential',
    'standard'
  ],
  rules: {
    // 设置默认eslint规则
    'one-var': 0,
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': 0,
    'no-console': 0,
    semi: 0,
    'comma-dangle': ['error', 'never'],
    'no-extra-semi': 2,
    'space-before-function-paren': 0,
    eqeqeq: 0,
    'spaced-comment': 0,
    'no-useless-escape': 0,
    'no-tabs': 0,
    'no-mixed-spaces-and-tabs': 0,
    'new-cap': 0,
    camelcase: 0,
    'no-new': 0,
    indent: 0,
    // 设置typescript-eslint规则
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules
    '@typescript-eslint/semi': 0,
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-empty-interface': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'import/no-named-default': 0,
    '@typescript-eslint/no-inferrable-types': 0,
    'no-unused-expressions': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/camelcase': 0,
    'no-use-before-define': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-proto': 0,
    '@typescript-eslint/ban-types': 0,
    'no-useless-constructor': 0
  }
}
