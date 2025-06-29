import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

export async function importNewCharacters() {
  const rawData = await fs.readFile('src/data/ืnewCharacter.json', 'utf-8');
  const characters = JSON.parse(rawData);

  // 🔥 ลบทั้งหมดก่อน
 
  // ➕ เพิ่มใหม่ทั้งหมด
  for (const char of characters) {
    await prisma.character.create({ data: char });
    console.log(`✅ เพิ่ม: ${char.name}`);
  }

  console.log('🎉 Syncเสร็จแล้ว');
}

importNewCharacters()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
