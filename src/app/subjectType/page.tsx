export default function SubjectTypePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="h-[70px] bg-white/90 border-b border-slate-200 backdrop-blur-xl flex items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-3 font-semibold">
          <span className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 text-xs font-semibold">
            MATHÉMATIQUES
          </span>
          Bac Blanc 2024 - Sujet A
        </div>
        <div className="font-mono text-lg font-bold px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
          02:45:12
        </div>
        <button className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
          Terminer l&apos;examen
        </button>
      </header>

      <div className="flex flex-1">
        <section className="flex-[2] bg-slate-50 border-r border-slate-200 flex justify-center px-6 py-10">
          <div className="w-full max-w-3xl bg-white border border-slate-200 shadow-sm p-10">
            <h1 className="text-2xl font-bold text-slate-900 font-outfit">BACCALAURÉAT GÉNÉRAL</h1>
            <p className="text-indigo-600 font-semibold mt-2">
              ÉPREUVE DE MATHÉMATIQUES - Durée : 4 heures
            </p>
            <p className="mt-6 text-sm text-slate-500 italic">
              L&apos;usage de la calculatrice est autorisé.
            </p>

            <div className="mt-10 space-y-10">
              <div className="pb-6 border-b border-slate-200">
                <p className="text-lg text-slate-800">
                  <span className="text-indigo-600 font-bold">Exercice 1.</span> (5 points)
                </p>
                <p className="mt-3 text-slate-600">
                  {"Soit la suite (u_n) définie pour tout entier naturel n par :"}
                </p>
                <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-4 text-center text-lg">
                  {"u₀ = 1 et u_{n+1} = (1/2)u_n + 2"}
                </div>
                <p className="mt-4 text-slate-600">
                  {"1. a. Démontrer par récurrence que pour tout entier naturel n, on a 0 < u_n ≤ 4."}
                </p>
                <p className="mt-2 text-slate-600">
                  {"b. Démontrer que la suite (u_n) est croissante."}
                </p>
                <p className="mt-2 text-slate-600">
                  {"c. En déduire que la suite (u_n) converge vers une limite L."}
                </p>
                <p className="mt-2 text-slate-600">
                  {"d. Déterminer la valeur exacte de la limite L."}
                </p>
              </div>

              <div className="pb-6 border-b border-slate-200">
                <p className="text-lg text-slate-800">
                  <span className="text-indigo-600 font-bold">Exercice 2.</span> (6 points)
                </p>
                <p className="mt-3 text-slate-600">
                  {"Le plan complexe est rapporté à un repère orthonormé direct (O; u⃗, v⃗)."}
                </p>
                <p className="mt-2 text-slate-600">
                  {"On considère les points A, B, C d'affixes respectives : z_A = 1+i, z_B = 2-2i et z_C = -1+3i."}
                </p>
                <p className="mt-2 text-slate-600">
                  {"1. Placer les points A, B et C sur une figure que l'on complétera au fur et à mesure des questions."}
                </p>
                <p className="mt-2 text-slate-600">
                  {"2. Calculer le module et un argument de z_A."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex-1 bg-white border-l border-slate-200 flex flex-col">
          <div className="flex border-b border-slate-200 text-sm">
            <button className="flex-1 px-4 py-4 text-indigo-700 border-b-2 border-indigo-500 bg-indigo-50">
              Assistant IA
            </button>
            <button className="flex-1 px-4 py-4 text-slate-500 hover:text-slate-900 transition-colors">
              Brouillon
            </button>
            <button className="flex-1 px-4 py-4 text-slate-500 hover:text-slate-900 transition-colors">
              Formules
            </button>
          </div>

          <div className="flex-1 p-6 space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <h4 className="text-indigo-700 font-semibold flex items-center gap-2">
                Indice disponible
              </h4>
              <p className="text-sm text-slate-600 mt-2">
                {"Je vois que tu bloques sur la récurrence. Vérifie l'initialisation puis l'hérédité."}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-slate-800 font-semibold flex items-center gap-2">
                Gestion du temps
              </h4>
              <p className="text-sm text-slate-500 mt-2">
                {"Vous avez passé 45 minutes sur l'exercice 1. Pensez à passer à l'exercice 2 sous 15 minutes."}
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 flex gap-3">
            <input
              type="text"
              placeholder="Poser une question..."
              className="flex-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
            <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-semibold">
              →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
