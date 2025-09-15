import mongoose from 'mongoose';
import { db } from '../configVars';
import { ProductModel } from '../database/model/Product';
import { model as mongooseModel } from 'mongoose';
import ICategory, { CATEGORY_DOCUMENT_NAME } from '../database/model/Category';

async function connectDB() {
  const uri = db.uri || `mongodb://${db.host}`;
  if (!uri) throw new Error('DB connection string is missing');
  await mongoose.connect(uri, { dbName: undefined } as any);
}

async function ensureCategory(nameAng: string, nameAr: string) {
  const Category = mongooseModel<ICategory>(CATEGORY_DOCUMENT_NAME);
  let cat = await Category.findOne({ nameAng });
  if (!cat) {
    cat = await Category.create({ nameAng, nameAr });
  }
  return cat;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < Math.min(count, copy.length)) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

async function seed() {
  await connectDB();

  const categories = [
    await ensureCategory('Laptops', 'لاب توبات'),
    await ensureCategory('Headphones', 'سماعات'),
    await ensureCategory('Accessories', 'اكسسوارات'),
  ];

  const sampleImages = [
    'https://picsum.photos/seed/1/600/400',
    'https://picsum.photos/seed/2/600/400',
    'https://picsum.photos/seed/3/600/400',
    'https://picsum.photos/seed/4/600/400',
  ];

  const productsPerCategory = 8;
  const created: { _id: string; nameAng: string; category: string }[] = [];

  for (const cat of categories) {
    for (let i = 1; i <= productsPerCategory; i++) {
      const nameAng = `${cat.nameAng} ${i}`;
      const doc = await ProductModel.create({
        nameAng,
        nameAr: `${cat.nameAr} ${i}`,
        descriptionAng: `High-quality ${cat.nameAng.toLowerCase()} model ${i}`,
        descriptionAr: `منتج ${cat.nameAr.toLowerCase()} عالي الجودة رقم ${i}`,
        isRecommended: i % 3 === 0,
        isTopSeller: i % 4 === 0,
        images: pickRandom(sampleImages, 3),
        coverImage: sampleImages[i % sampleImages.length],
        price: Math.round(50 + Math.random() * 950),
        category: cat._id,
        position: i,
        minSupp: 0,
        maxSupp: 0,
        stores: [],
        supplements: [],
      });
      created.push({ _id: doc._id.toString(), nameAng, category: (cat as any).nameAng });
    }
  }

  // Build related map by category
  const relatedMap: Record<string, string[]> = {};
  for (const p of created) {
    const siblings = created
      .filter((o) => o.category === p.category && o._id !== p._id)
      .slice(0, 6)
      .map((o) => o._id);
    relatedMap[p._id] = siblings;
  }

  console.log('Seeded products:', created.length);
  console.log('Example related map (first 5):', Object.entries(relatedMap).slice(0, 5));

  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
