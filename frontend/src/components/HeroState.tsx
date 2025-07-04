import { motion } from "framer-motion";

export type HeroStageHero = {
  id: string;
  name: string;
  job: string;
  rarity: number;
  hp: number;
  atk: number;
  def: number;
  speed: number;
  element: string;
  imageUrl: string;
};

type Props = {
  heroes?: HeroStageHero[];
};

export default function HeroStage({ heroes = [] }: Props) {
  const hasHeroes = heroes.length > 0;

  const renderStars = (rarity: number) => "⭐".repeat(rarity);

  return (
    <div className="relative w-full h-[350px] flex items-center justify-center overflow-hidden space-x-6 px-4">
      {hasHeroes ? (
        heroes.map((hero, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center z-10 p-2 w-48"
          >
            {/* Stats Box - no bg, just styled text */}
            <div className="text-sm text-purple-200 w-full text-left space-y-1 mb-2 px-2 py-1 rounded border border-purple-600/30 shadow-md shadow-purple-700/10 backdrop-blur-md">
              <div className="text-center text-yellow-300 text-base font-bold tracking-wide drop-shadow">
                {renderStars(hero.rarity)}
              </div>
              <div className="flex justify-between text-[13px]">
                <span>🌀 {hero.element}</span>
                <span>❤️ {hero.hp}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span>🗡️ {hero.atk}</span>
                <span>🛡️ {hero.def}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span>⚡ SPD</span>
                <span>{hero.speed}</span>
              </div>
            </div>

            {/* Hero Image */}
            <img
              src={hero.imageUrl}
              alt={hero.name}
              className="w-24 h-24 object-contain mt-1 drop-shadow-xl"
            />

            {/* Name + Job */}
            <div className="mt-2 text-center">
              <h3 className="text-md font-semibold text-purple-100 drop-shadow-sm">
                {hero.name}
              </h3>
              <p className="text-sm text-purple-400">{hero.job}</p>
            </div>

            {/* Stage */}
            <div className="mt-2 w-20 h-3 bg-black/30 rounded-full blur-sm shadow-sm" />
          </motion.div>
        ))
      ) : (
        <div className="flex flex-col items-center z-10">
          <div className="w-24 h-24 rounded-full bg-gray-300/20 flex items-center justify-center text-gray-400 text-3xl">
            ➕
          </div>
          <p className="mt-2 text-sm text-white">ยังไม่มีฮีโร่</p>
        </div>
      )}
    </div>
  );
}
