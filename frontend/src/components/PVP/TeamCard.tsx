// components/TeamCard.tsx
export default function TeamCard({ team, color }: { team: any, color: "red" | "green" }) {
    return (
        <div className={`bg-gradient-to-br from-${color}-800 to-${color}-600 p-4 rounded-xl shadow-xl w-1/3 border-2 border-${color}-300`}>
            <h2 className="text-xl font-bold mb-2 text-white">
                {color === "red" ? "👾 ทีมศัตรู" : "🧍‍♂️ ทีมของคุณ"}
            </h2>
            <p className="mb-1">👤 เจ้าของทีม: {team?.user?.username}</p>
            <p className="mb-3">📛 ชื่อทีม: {team?.name}</p>
            {team?.teamMembers?.map((m: any) => (
                <div key={m.userCharacter.id} className="flex items-center gap-2 mb-2 bg-black/30 p-1 rounded">
                    <img
                        src={m.userCharacter.character.imageUrl}
                        alt={m.userCharacter.character.name}
                        className={`w-10 h-10 rounded object-cover border border-${color}-300`}
                    />
                    <p>{m.userCharacter.character.name}</p>
                </div>
            ))}
        </div>
    );
}
