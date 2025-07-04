import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

export async function importCharacters() {
  const rawData = await fs.readFile('src/data/characters.json', 'utf-8');
  const characters = JSON.parse(rawData);

  // 🔥 ลบทั้งหมดก่อน
  await prisma.teamMember.deleteMany();
  await prisma.userCharacter.deleteMany();
  await prisma.character.deleteMany(); 
  console.log('🗑️ ลบข้อมูลตัวละครเก่าทั้งหมดแล้ว');

  // ➕ เพิ่มใหม่ทั้งหมด
  for (const char of characters) {
    await prisma.character.create({ data: char });
    console.log(`✅ เพิ่ม: ${char.name}`);
  }

  console.log('🎉 Sync เสร็จแล้ว');
}

importCharacters()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
