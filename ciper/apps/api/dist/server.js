"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const database_js_1 = require("./config/database.js");
const env_js_1 = require("./config/env.js");
const start = async () => {
    await (0, database_js_1.connectDatabase)();
    (0, app_js_1.createApp)().listen(env_js_1.env.API_PORT, () => console.log(`BugForge API listening on ${env_js_1.env.API_PORT}`));
};
void start();
