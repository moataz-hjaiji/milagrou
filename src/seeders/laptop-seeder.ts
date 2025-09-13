import mongoose from 'mongoose';
import { connect } from '../database';
import { ProductModel } from '../database/model/Product';
import { CategoryModel } from '../database/model/Category';
import { StoreModel } from '../database/model/Store';
import { SupplementModel } from '../database/model/Supplement';

// Laptop brands and models data
const laptopBrands = [
  'Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Microsoft', 'Razer'
];

const laptopModels = [
  'MacBook Pro', 'MacBook Air', 'Inspiron', 'XPS', 'Pavilion', 'Envy', 'ThinkPad', 'IdeaPad', 'Yoga',
  'VivoBook', 'ZenBook', 'ROG', 'TUF', 'Aspire', 'Swift', 'Nitro', 'Prestige', 'Creator', 'Galaxy Book',
  'Surface', 'Blade', 'Stealth', 'Alienware', 'Latitude', 'Precision', 'EliteBook', 'ProBook'
];

const laptopSpecs = [
  'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
  'Apple M1', 'Apple M2', 'Apple M3', 'Intel Core i3', 'AMD Ryzen 3'
];

const laptopRAM = ['8GB', '16GB', '32GB', '64GB'];
const laptopStorage = ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '1TB HDD', '2TB HDD'];
const laptopScreens = ['13"', '14"', '15.6"', '16"', '17.3"'];

const laptopDescriptions = [
  'High-performance laptop perfect for professionals and students',
  'Ultra-portable design with powerful processing capabilities',
  'Gaming laptop with advanced graphics and cooling system',
  'Business laptop with enterprise-grade security features',
  'Creative workstation for designers and content creators',
  'Budget-friendly laptop with essential features',
  'Premium laptop with cutting-edge technology',
  'Convertible laptop with touchscreen functionality',
  'Workstation laptop for intensive computing tasks',
  'Student laptop with long battery life and durability'
];

const laptopImages = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
];

// Generate random laptop data
function generateLaptopData(index: number) {
  const brand = laptopBrands[Math.floor(Math.random() * laptopBrands.length)];
  const model = laptopModels[Math.floor(Math.random() * laptopModels.length)];
  const spec = laptopSpecs[Math.floor(Math.random() * laptopSpecs.length)];
  const ram = laptopRAM[Math.floor(Math.random() * laptopRAM.length)];
  const storage = laptopStorage[Math.floor(Math.random() * laptopStorage.length)];
  const screen = laptopScreens[Math.floor(Math.random() * laptopScreens.length)];
  const description = laptopDescriptions[Math.floor(Math.random() * laptopDescriptions.length)];
  
  const nameAng = `${brand} ${model} ${spec} ${ram} ${storage} ${screen}`;
  const nameAr = `لابتوب ${brand} ${model} ${spec} ${ram} ${storage} ${screen}`;
  
  const price = Math.floor(Math.random() * 3000) + 500; // $500 - $3500
  const isRecommended = Math.random() > 0.7;
  const isTopSeller = Math.random() > 0.8;
  
  return {
    nameAng,
    nameAr,
    descriptionAng: `${description}. Features ${spec} processor, ${ram} RAM, ${storage} storage, and ${screen} display.`,
    descriptionAr: `${description}. يتميز بمعالج ${spec}، ذاكرة ${ram}، تخزين ${storage}، وشاشة ${screen}.`,
    price,
    isRecommended,
    isTopSeller,
    images: laptopImages,
    coverImage: laptopImages[0],
    position: index + 1,
    minSupp: 1,
    maxSupp: 10
  };
}

async function seedLaptops() {
  try {
    console.log('🌱 Starting laptop seeder...');
    
    // Connect to database
    await connect();
    console.log('✅ Connected to database');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await StoreModel.deleteMany({});
    await SupplementModel.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create laptop categories
    console.log('📁 Creating categories...');
    const laptopCategory = await CategoryModel.create({
      nameAng: 'Laptops',
      nameAr: 'أجهزة الكمبيوتر المحمولة'
    });

    const gamingCategory = await CategoryModel.create({
      nameAng: 'Gaming Laptops',
      nameAr: 'أجهزة الكمبيوتر للألعاب'
    });

    const businessCategory = await CategoryModel.create({
      nameAng: 'Business Laptops',
      nameAr: 'أجهزة الكمبيوتر للأعمال'
    });

    const budgetCategory = await CategoryModel.create({
      nameAng: 'Budget Laptops',
      nameAr: 'أجهزة الكمبيوتر الاقتصادية'
    });

    console.log('✅ Created categories');

    // Create stores
    console.log('🏪 Creating stores...');
    const stores = await StoreModel.create([
      { nameAng: 'Main Store', nameAr: 'المتجر الرئيسي' },
      { nameAng: 'Downtown Branch', nameAr: 'فرع وسط المدينة' },
      { nameAng: 'Mall Location', nameAr: 'موقع المول' },
      { nameAng: 'Online Warehouse', nameAr: 'مستودع الإنترنت' }
    ]);
    console.log('✅ Created stores');

    // Create laptop supplements (accessories)
    console.log('🔌 Creating laptop accessories...');
    const supplements = await SupplementModel.create([
      { 
        nameAng: 'Wireless Mouse', 
        nameAr: 'ماوس لاسلكي',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300'
      },
      { 
        nameAng: 'Laptop Bag', 
        nameAr: 'حقيبة لابتوب',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'
      },
      { 
        nameAng: 'USB-C Hub', 
        nameAr: 'محول USB-C',
        image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300'
      },
      { 
        nameAng: 'Laptop Stand', 
        nameAr: 'حامل لابتوب',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300'
      },
      { 
        nameAng: 'External Hard Drive', 
        nameAr: 'قرص صلب خارجي',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300'
      },
      { 
        nameAng: 'Laptop Cooling Pad', 
        nameAr: 'وسادة تبريد لابتوب',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300'
      },
      { 
        nameAng: 'Wireless Keyboard', 
        nameAr: 'لوحة مفاتيح لاسلكية',
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300'
      },
      { 
        nameAng: 'Laptop Charger', 
        nameAr: 'شاحن لابتوب',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300'
      }
    ]);
    console.log('✅ Created laptop accessories');

    // Create 50 laptop products
    console.log('💻 Creating 50 laptop products...');
    const products = [];
    
    for (let i = 0; i < 50; i++) {
      const laptopData = generateLaptopData(i);
      
      // Assign random category
      const categories = [laptopCategory, gamingCategory, businessCategory, budgetCategory];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Assign random stores with quantities
      const storeAssignments = stores.map(store => ({
        store: store._id,
        quantity: Math.floor(Math.random() * 20) + 5 // 5-25 units per store
      }));
      
      // Assign random supplements with prices
      const supplementAssignments = supplements.slice(0, Math.floor(Math.random() * 4) + 2).map(supplement => ({
        supplement: supplement._id,
        price: Math.floor(Math.random() * 100) + 10 // $10-$110
      }));
      
      const product = {
        ...laptopData,
        category: category._id,
        stores: storeAssignments,
        supplements: supplementAssignments
      };
      
      products.push(product);
    }
    
    await ProductModel.insertMany(products);
    console.log('✅ Created 50 laptop products');

    // Display summary
    const totalProducts = await ProductModel.countDocuments();
    const totalCategories = await CategoryModel.countDocuments();
    const totalStores = await StoreModel.countDocuments();
    const totalSupplements = await SupplementModel.countDocuments();
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Products: ${totalProducts}`);
    console.log(`   • Categories: ${totalCategories}`);
    console.log(`   • Stores: ${totalStores}`);
    console.log(`   • Supplements: ${totalSupplements}`);
    
    // Show some sample products
    console.log('\n📋 Sample products created:');
    const sampleProducts = await ProductModel.find().limit(5).populate('category', 'nameAng');
    sampleProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.nameAng} - $${product.price}`);
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeder
if (require.main === module) {
  seedLaptops()
    .then(() => {
      console.log('✅ Seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeder failed:', error);
      process.exit(1);
    });
}

export default seedLaptops;
