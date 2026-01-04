export const apps = [{
  name: "discord-mc-server-manager",
  script: "./discord-mc-server-manager.js",
  env: {
    NODE_ENV: "development"
  },
  env_production: {
    NODE_ENV: "production",
  }
}]

// module.exports = {
//   apps: [{
//     name: "app",
//     script: "./app.js",
//     env: {
//       NODE_ENV: "development"
//     },
//     env_test: {
//       NODE_ENV: "test",
//     },
//     env_staging: {
//       NODE_ENV: "staging",
//     },
//     env_production: {
//       NODE_ENV: "production",
//     }
//   }]
// }