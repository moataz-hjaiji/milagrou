import FavouriteRepo from '../../database/repository/FavouriteRepo';

export async function checkFavourite(userId: string, product: string) {
  const favourite = await FavouriteRepo.findByObj({
    userId,
    product,
  });
  return !!favourite;
}
