module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
};