import { seedAdmin } from './seed.admin';
import { adminSeeder, userSeeder, environment } from '../../configVars';
import { seedDelete } from './drop';
import '../../database';
import { seedUser } from './seed.user';
import { seedDeliveryPrice } from './seed.deliveryPrice';
import { seedPermissions } from './seed.permission';

export let seed = async (args = { clearDatabase: false }) => {
  if (args.clearDatabase) await seedDelete();

  await seedPermissions();

  await seedAdmin(
    adminSeeder.adminEmail,
    adminSeeder.adminPass,
    adminSeeder.adminName,
    adminSeeder.adminPhone
  );

  await seedUser(
    userSeeder.userEmail,
    userSeeder.userPass,
    userSeeder.userName,
    userSeeder.userPhone
  );

  await seedDeliveryPrice();

  environment !== 'test' && process.exit(1);
};

seed({ clearDatabase: environment === 'test' });
