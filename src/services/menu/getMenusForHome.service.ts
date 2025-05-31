import IMenu from '../../database/model/Menu';
import CategoryRepo from '../../database/repository/CategoryRepo';
import MenuRepo from '../../database/repository/MenuRepo';

export const getMenusForHome = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const menus = await MenuRepo.findAll(options, query);

  let result: any = [];

  await Promise.all(
    menus.docs.map(async (menu: IMenu) => {
      const categories = await CategoryRepo.findAllNotPaginated({
        menu: menu._id,
      });

      const resultMenu = { ...menu, categories };
      result.push(resultMenu);
    })
  );

  const { docs, ...meta } = menus;
  return {
    meta,
    docs: result,
  };
};
