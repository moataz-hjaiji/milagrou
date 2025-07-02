import { seedAdmin } from './seed.admin';
import { adminSeeder, userSeeder, environment } from '../../configVars';
import { seedDelete } from './drop';
import '../../database';
import { seedUser } from './seed.user';
import { seedPermissions } from './seed.permission';

export let seed = async (args = { clearDatabase: false }) => {
  if (args.clearDatabase) await seedDelete();

  await seedPermissions();

  await seedAdmin(
    adminSeeder.adminEmail,
    adminSeeder.adminPass,
    adminSeeder.adminFirstName,
    adminSeeder.adminLastName,
    adminSeeder.adminPhone
  );

  await seedUser(
    userSeeder.userEmail,
    userSeeder.userPass,
    userSeeder.userFirstName,
    userSeeder.userLastName,
    userSeeder.userPhone
  );

  environment !== 'test' && process.exit(1);
};

seed({ clearDatabase: environment === 'test' });
