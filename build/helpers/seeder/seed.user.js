"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUser = void 0;
const Role_1 = require("../../database/model/Role");
const User_1 = require("../../database/model/User");
const seedUser = async (email, password, userFirstName, userLastName, phoneNumber) => {
    const roleUser = await Role_1.RoleModel.findOne({ name: 'user' });
    if (!roleUser) {
        console.log('Error seeding User : Role user not found');
    }
    else {
        try {
            await User_1.UserModel.create({
                roles: [roleUser.id],
                userFirstName,
                userLastName,
                email,
                password,
                phoneNumber,
                verified: true,
            });
            console.log('User seeded');
        }
        catch (error) {
            console.log('Error seeding User : ', error);
        }
    }
};
exports.seedUser = seedUser;
//# sourceMappingURL=seed.user.js.map