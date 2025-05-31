import AddressRepo from '../../database/repository/AddressRepo';

interface lookupParams {
  longitude: number;
  latitude: number;
  adressIds: string[];
}

export const findAdressesSortedByLocation = async ({
  longitude,
  latitude,
  adressIds,
}: lookupParams) => {
  const result = await AddressRepo.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [latitude, longitude],
        },
        distanceField: 'distance',
        spherical: true,
        query: { _id: { $in: adressIds }, deletedAt: null },
      },
    },
    { $sort: { distance: 1 } },
  ]);

  return result;
};
