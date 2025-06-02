"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const seed_admin_1 = require("./seed.admin");
const configVars_1 = require("../../configVars");
const drop_1 = require("./drop");
require("../../database");
const seed_user_1 = require("./seed.user");
const seed_permission_1 = require("./seed.permission");
let seed = async (args = { clearDatabase: false }) => {
    if (args.clearDatabase)
        await (0, drop_1.seedDelete)();
    await (0, seed_permission_1.seedPermissions)();
    await (0, seed_admin_1.seedAdmin)(configVars_1.adminSeeder.adminEmail, configVars_1.adminSeeder.adminPass, configVars_1.adminSeeder.adminFirstName, configVars_1.adminSeeder.adminLastName, configVars_1.adminSeeder.adminPhone);
    await (0, seed_user_1.seedUser)(configVars_1.userSeeder.userEmail, configVars_1.userSeeder.userPass, configVars_1.userSeeder.userFirstName, configVars_1.userSeeder.userLastName, configVars_1.userSeeder.userPhone);
    configVars_1.environment !== 'test' && process.exit(1);
};
exports.seed = seed;
(0, exports.seed)({ clearDatabase: configVars_1.environment === 'test' });
//# sourceMappingURL=index.js.map