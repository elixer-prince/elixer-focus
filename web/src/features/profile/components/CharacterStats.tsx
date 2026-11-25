const characterStats = [
  { name: "Focus", value: 78 },
  { name: "Discipline", value: 64 },
  { name: "Creativity", value: 52 },
];

const CharacterStats = () => (
  <section
    aria-labelledby="character-stats-heading"
    className="bg-base-100 rounded-box border-base-300 space-y-5 border p-6 shadow-sm transition-colors duration-500"
  >
    <header>
      <h2
        id="character-stats-heading"
        className="text-base-content text-xl font-semibold"
      >
        Character stats
      </h2>
      <p className="text-base-content/60 mt-1 text-sm">
        A few character traits for fun. Your real progress is shown above.
      </p>
    </header>

    <ul className="space-y-4">
      {characterStats.map((stat) => (
        <li key={stat.name}>
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-base-content font-medium">{stat.name}</span>
            <span className="text-base-content/60 text-sm">Placeholder</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={stat.value}
            max={100}
            aria-label={`${stat.name} placeholder value`}
          />
        </li>
      ))}
    </ul>
  </section>
);

export default CharacterStats;
