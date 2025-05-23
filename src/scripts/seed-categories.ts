//todo: create a script to seed categories

 import { db } from "@/db";
 import { categories } from "@/db/schema";
const categoryNames = [
    'General',
    'Technology',
    'Health',
    'Science',
    'Sports',
    'Entertainment',
    'Business',
    'Education',
    'Lifestyle',
    'Travel',
];

async function main(){
    console.log("Seeding categories...");
    try {
        const values = categoryNames.map((name) => ({
            name,
            description: `This is the ${name} category`,
        }));
        await db.insert(categories).values(values)
        console.log("Categories seeded successfully");
    }catch (error) {
        console.error("Error seeding categories",error);
        process.exit(1);
    }

}
main()