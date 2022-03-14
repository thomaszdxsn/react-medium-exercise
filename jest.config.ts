export default {
  testMatch: ["**/tests/**/*.[jt]s?(x)"],
  transform: {
    "^.+.(ts|tsx)$": "ts-jest",
  },
  testEnvironment: "jsdom",
};
