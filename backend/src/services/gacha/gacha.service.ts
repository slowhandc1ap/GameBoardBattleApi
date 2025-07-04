import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GACHA_COST = 100; // 💰 หัก coin ถ้าใช้ฟรีหมด
const gachaRates = {
    5: 5,    // 5%
    4: 15,   // 15%
    3: 30,   // 30%
    2: 30,   // 30%
    1: 20    // 20%
};
function getRandomRarity(): number {
    const rand = Math.random() * 100;
    let total = 0;

    for (const [rarity, chance] of Object.entries(gachaRates)) {
        total += Number(chance);
        if (rand < total) return Number(rarity);
    }
    return 1; // fallback
}


export const handleGachaDraw = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const allCharacters = await prisma.character.findMany();
  if (allCharacters.length === 0) throw new Error('No characters available');

  const chosenRarity = getRandomRarity();

  const candidates = await prisma.character.findMany({
    where: { rarity: chosenRarity }
  });

  if (candidates.length === 0) throw new Error(`No characters with rarity ${chosenRarity}`);

  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  // ✅ หักฟรี/coin ก่อนเลย (ถือว่าสุ่มแล้ว ไม่ว่าผลจะเกลือหรือไม่)
  if (user.freeGachaUse > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeGachaUse: { decrement: 1 } }
    });
  } else {
    if (user.coin < GACHA_COST) throw new Error('Not enough coin');
    await prisma.user.update({
      where: { id: userId },
      data: { coin: { decrement: GACHA_COST } }
    });
  }

  // ✅ เช็คว่าผู้เล่นมีตัวนี้อยู่แล้วไหม
  const alreadyOwned = await prisma.userCharacter.findFirst({
    where: {
      userId,
      characterId: selected.id
    }
  });

  // ✅ ถ้าเป็นตัวใหม่ → เพิ่มเข้า database
  if (!alreadyOwned) {
    const newChar = await prisma.userCharacter.create({
      data: {
        userId,
        characterId: selected.id,
        nickname: null
      },
      include: {
        character: true
      }
    });

    return {
      message: "🎉 You've got a NEW character!",
      character: newChar.character,
      isDuplicate: false,
      freeGachaLeft: user.freeGachaUse > 0 ? user.freeGachaUse - 1 : 0,
      coinLeft: user.coin > GACHA_COST ? user.coin - GACHA_COST : 0
    };
  }

  // ✅ ถ้าเป็นตัวเดิม → ไม่บันทึก แค่ return เกลือ
  return {
    message: "💀 ตัวซ้ำเเหะ เกลือชัดๆ...",
    character: selected,
    isDuplicate: true,
    freeGachaLeft: user.freeGachaUse > 0 ? user.freeGachaUse - 1 : 0,
    coinLeft: user.coin > GACHA_COST ? user.coin - GACHA_COST : 0
  };
};
