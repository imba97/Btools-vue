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
    '@typescript-eslint/explicit-function-return-type': 0
  }
}
