import { RoleModel } from '../../database/model/Role';
import { UserModel } from '../../database/model/User';

export const seedAdmin = async (
  email: string,
  password: string,
  userFirstName: string,
  userLastName: string,
  phoneNumber: string
) => {
  const roleAdmin = await RoleModel.findOne({ name: 'admin' });

  if (!roleAdmin) {
    console.log('Error seeding Admin : Role admin not found');
  } else {
    try {
      await UserModel.create({
        roles: [roleAdmin.id],
        userFirstName,
        userLastName,
        phoneNumber,
        email,
        password,
      });
      console.log('Admin seeded');
    } catch (error) {
      console.log('Error seeding Admin : ', error);
    }
  }
};
