export const metadata = {
  title: "How to Count Cards in Blackjack",
  description: "A complete guide to Hi-Lo card counting in blackjack. Learn the running count, true count, and how to use the count to gain an edge, with real in-game examples.",
  alternates: { canonical: "/how-to-count-cards" },
};

function CardBadge({ rank, suit, value }) {
  const color =
    value === "+1" ? "text-green-400 border-green-700 bg-green-950"
    : value === "-1" ? "text-red-400 border-red-700 bg-red-950"
    : "text-gray-400 border-gray-700 bg-gray-800";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-bold text-sm ${color}`}>
      {rank}{suit}
      {value && <span className="opacity-70 text-xs">{value}</span>}
    </span>
  );
}

function ExampleHand({ label, cards, rc, rcBefore, explanation }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      {label && <div className="text-yellow-400 font-bold text-xs uppercase tracking-wider">{label}</div>}
      <div className="flex flex-wrap gap-2 items-center">
        {cards.map((c, i) => (
          <CardBadge key={i} rank={c.rank} suit={c.suit} value={c.value} />
        ))}
      </div>
      <div className="text-sm text-gray-400 leading-relaxed">{explanation}</div>
      {rc !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Running count:</span>
          {rcBefore !== undefined && (
            <>
              <span className={`font-bold ${rcBefore > 0 ? "text-green-400" : rcBefore < 0 ? "text-red-400" : "text-gray-400"}`}>
                {rcBefore > 0 ? "+" : ""}{rcBefore}
              </span>
              <span className="text-gray-600">to</span>
            </>
          )}
          <span className={`font-black text-lg ${rc > 0 ? "text-green-400" : rc < 0 ? "text-red-400" : "text-gray-400"}`}>
            {rc > 0 ? "+" : ""}{rc}
          </span>
        </div>
      )}
    </div>
  );
}

export default function HowToCountCards() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">

        <div>
          <a href="/" className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">
            Back to Trainer
          </a>
          <h1 className="text-3xl font-black text-white mt-4 mb-3">How to Count Cards</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Card counting is a skill, not a trick. It gives you a mathematical edge by tracking
            whether the remaining shoe is favorable to you or to the dealer. This guide covers
            the Hi-Lo system, the same method used in this trainer.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-white font-bold text-xl">Why counting works</h2>
          <p className="leading-relaxed">
            A blackjack shoe is not random between hands. Cards dealt in previous hands are gone
            until the shoe is reshuffled. If many low cards (2 through 6) have already been dealt,
            the remaining shoe is full of high cards. That is good for you: high cards produce
            more blackjacks, and blackjack pays 3:2. High cards also bust the dealer more often,
            because the dealer is forced to hit on totals of 16 or less.
          </p>
          <p className="leading-relaxed">
            Conversely, a shoe full of low cards hurts you. The dealer is less likely to bust,
            and you are less likely to be dealt a blackjack.
          </p>
          <p className="leading-relaxed">
            Card counting tracks this imbalance. When the count says the shoe is rich in high
            cards, you raise your bet. When it says the shoe is low-card heavy, you bet the
            minimum.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-white font-bold text-xl">The Hi-Lo values</h2>
          <p className="leading-relaxed">
            Every card in the deck is assigned a point value. You add or subtract that value
            from your running count every time a card is dealt, face-up, to any player or
            the dealer.
          </p>

          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left">Cards</th>
                  <th className="px-4 py-3 text-left">Count value</th>
                  <th className="px-4 py-3 text-left">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-green-400">2, 3, 4, 5, 6</td>
                  <td className="px-4 py-3 font-black text-green-400">+1</td>
                  <td className="px-4 py-3 text-gray-400">Low cards leaving the shoe is good for you</td>
                </tr>
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-gray-400">7, 8, 9</td>
                  <td className="px-4 py-3 font-black text-gray-400">0</td>
                  <td className="px-4 py-3 text-gray-400">Neutral cards, no meaningful effect</td>
                </tr>
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-red-400">10, J, Q, K, A</td>
                  <td className="px-4 py-3 font-black text-red-400">-1</td>
                  <td className="px-4 py-3 text-gray-400">High cards leaving the shoe hurts you</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="leading-relaxed">
            The reason the values are balanced (equal numbers of +1 and -1 cards) is that a
            fresh shoe starts at exactly 0. After any complete shoe is dealt, the count returns
            to 0. This means you can detect imbalance simply by watching whether the count
            drifts positive or negative.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-white font-bold text-xl">The running count</h2>
          <p className="leading-relaxed">
            The running count is a single number you keep in your head. You start at 0 at the
            beginning of a new shoe and adjust it by the Hi-Lo value of every card you see.
            You count every visible card: your cards, other players' cards, and the dealer's
            face-up card. The only card you cannot count is the dealer's hole card, since it
            is face-down.
          </p>

          <h3 className="text-gray-200 font-semibold">Example hand 1: count goes positive</h3>
          <ExampleHand
            label="Cards dealt"
            cards={[
              { rank: "6", suit: "♥", value: "+1" },
              { rank: "4", suit: "♠", value: "+1" },
              { rank: "9", suit: "♦", value: "0" },
              { rank: "5", suit: "♣", value: "+1" },
              { rank: "3", suit: "♥", value: "+1" },
            ]}
            rcBefore={0}
            rc={4}
            explanation="You are dealt 6 and 4. The dealer shows a 9. You hit and receive a 5. The dealer flips a 3. Four low cards and one neutral card were dealt. Each low card adds +1, the 9 adds nothing. Running count goes from 0 to +4."
          />

          <h3 className="text-gray-200 font-semibold">Example hand 2: count goes negative</h3>
          <ExampleHand
            label="Cards dealt"
            cards={[
              { rank: "A", suit: "♠", value: "-1" },
              { rank: "K", suit: "♥", value: "-1" },
              { rank: "Q", suit: "♦", value: "-1" },
              { rank: "J", suit: "♣", value: "-1" },
            ]}
            rcBefore={4}
            rc={0}
            explanation="You are dealt Ace and King (blackjack). The dealer shows a Queen and flips a Jack underneath. Four high cards dealt. Each subtracts 1. Running count drops from +4 back to 0."
          />

          <h3 className="text-gray-200 font-semibold">Example hand 3: mixed hand</h3>
          <ExampleHand
            label="Cards dealt"
            cards={[
              { rank: "8", suit: "♠", value: "0" },
              { rank: "6", suit: "♦", value: "+1" },
              { rank: "10", suit: "♥", value: "-1" },
              { rank: "7", suit: "♣", value: "0" },
              { rank: "2", suit: "♠", value: "+1" },
              { rank: "9", suit: "♥", value: "0" },
            ]}
            rcBefore={0}
            rc={1}
            explanation="You have 8 and 6. Dealer shows a 10. You hit and get a 7 (total 21). Dealer flips a 2 and draws a 9. Two +1 cards, one -1 card, three neutral cards. Net change is +1."
          />
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-white font-bold text-xl">The true count</h2>
          <p className="leading-relaxed">
            The running count alone is incomplete. A running count of +8 sounds very positive,
            but if there are 4 decks remaining in the shoe, those extra high cards are spread
            thin. If there is only 1 deck remaining, +8 is extremely concentrated and very
            meaningful. The true count corrects for this by dividing the running count by
            the number of decks remaining.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center space-y-2">
            <div className="text-gray-400 text-sm">Formula</div>
            <div className="text-white font-black text-2xl">
              True Count = Running Count / Decks Remaining
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-white font-semibold text-sm">Example A</div>
              <div className="text-gray-400 text-sm">Running count is +8. Shoe has 4 decks remaining.</div>
              <div className="text-green-400 font-bold">True count = +8 / 4 = +2. Modest advantage.</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-white font-semibold text-sm">Example B</div>
              <div className="text-gray-400 text-sm">Running count is +8. Shoe has 1 deck remaining.</div>
              <div className="text-green-400 font-bold">True count = +8 / 1 = +8. Very strong advantage.</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-white font-semibold text-sm">Example C</div>
              <div className="text-gray-400 text-sm">Running count is -4. Shoe has 2 decks remaining.</div>
              <div className="text-red-400 font-bold">True count = -4 / 2 = -2. Shoe favors the dealer.</div>
            </div>
          </div>

          <p className="leading-relaxed">
            In this trainer, the true count is always displayed on the right panel. The decks
            remaining counter appears both in the top bar and in the count panel. You can
            practice computing the true count yourself before revealing it by using the Show
            and Hide toggle.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-white font-bold text-xl">How to bet with the count</h2>
          <p className="leading-relaxed">
            The whole point of counting is to bet more when you have an edge. The true count
            tells you how large that edge is. A simple approach is to use a bet spread: multiply
            your base bet by a factor tied to the true count.
          </p>

          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left">True Count</th>
                  <th className="px-4 py-3 text-left">Player edge</th>
                  <th className="px-4 py-3 text-left">Bet size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-red-400">-1 or lower</td>
                  <td className="px-4 py-3 text-red-400">-1% or worse</td>
                  <td className="px-4 py-3 text-gray-300">Minimum bet</td>
                </tr>
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-gray-400">0</td>
                  <td className="px-4 py-3 text-gray-400">-0.5% (house edge)</td>
                  <td className="px-4 py-3 text-gray-300">Minimum bet</td>
                </tr>
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-gray-400">+1</td>
                  <td className="px-4 py-3 text-gray-400">0% (breakeven)</td>
                  <td className="px-4 py-3 text-gray-300">Minimum bet</td>
                </tr>
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-yellow-400">+2</td>
                  <td className="px-4 py-3 text-yellow-400">+0.5%</td>
                  <td className="px-4 py-3 text-gray-300">2x base bet</td>
                </tr>
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-green-400">+3</td>
                  <td className="px-4 py-3 text-green-400">+1.0%</td>
                  <td className="px-4 py-3 text-gray-300">4x base bet</td>
                </tr>
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-green-400">+4</td>
                  <td className="px-4 py-3 text-green-400">+1.5%</td>
                  <td className="px-4 py-3 text-gray-300">8x base bet</td>
                </tr>
                <tr className="bg-gray-900">
                  <td className="px-4 py-3 font-bold text-green-400">+5 or higher</td>
                  <td className="px-4 py-3 text-green-400">+2.0% or more</td>
                  <td className="px-4 py-3 text-gray-300">8x base bet (max)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Edge estimates assume 6-deck S17 with perfect basic strategy. Each true count point
            is worth approximately 0.5%. The house starts with a 0.5% edge at a neutral count,
            so the player breaks even at TC +1 and gains roughly 0.5% for each point above that.
          </p>

          <p className="leading-relaxed">
            This is called a 1-to-8 spread. Real casino counters often use wider spreads,
            but larger spreads attract more attention from casino staff. The trainer shows
            a bet recommendation in the count panel when counts are revealed.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-white font-bold text-xl">Strategy changes at high counts</h2>
          <p className="leading-relaxed">
            Betting more at high counts is only part of it. Some basic strategy decisions
            also change when the true count is strongly positive or negative. These are called
            index plays. A few common ones:
          </p>
          <ul className="space-y-3 text-gray-400">
            <li className="flex gap-3">
              <span className="text-yellow-400 font-bold shrink-0">Insurance:</span>
              <span>Normally always decline insurance. At a true count of +3 or higher,
              the deck is so rich in tens that insurance becomes a profitable bet. This trainer
              flags this automatically in the insurance popup.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 font-bold shrink-0">16 vs 10:</span>
              <span>Basic strategy says surrender if available, otherwise hit. At a true count
              of 0 or higher, standing becomes correct because the deck is rich in tens and
              the dealer is more likely to bust.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 font-bold shrink-0">15 vs 10:</span>
              <span>Basic strategy says surrender or hit. At a true count of +4 or higher,
              standing is correct for the same reason.</span>
            </li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-white font-bold text-xl">Practicing with this trainer</h2>
          <p className="leading-relaxed">
            The count panel on the right side of the trainer shows your running count, true count,
            and deck temperature after each hand. The cards dealt each hand are listed with their
            Hi-Lo values so you can check your work.
          </p>
          <ol className="space-y-3 list-decimal list-inside text-gray-400">
            <li>
              <span className="text-gray-300">Start with Hide mode.</span> Try to keep the running
              count in your head as each hand is dealt.
            </li>
            <li>
              <span className="text-gray-300">Press Show after each hand</span> to compare your
              count to the correct value. The cards dealt panel shows each card and its value.
            </li>
            <li>
              <span className="text-gray-300">When your running count is consistent,</span> start
              dividing by decks remaining to practice the true count. The deck counter is always
              visible in the top bar.
            </li>
            <li>
              <span className="text-gray-300">Adjust your bet</span> in the bet input based on the
              true count before each deal. The trainer will show you whether your strategy decisions
              were correct regardless of count, so you can work on both skills together.
            </li>
          </ol>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-white font-bold text-xl">What counting does not do</h2>
          <p className="leading-relaxed">
            Card counting does not let you predict individual cards. Even at a true count of +8,
            you will still lose many hands. The edge from counting is small, around 0.5 to 1
            percent over the long run. This means you need a large number of hands before the
            math works in your favor consistently.
          </p>
          <p className="leading-relaxed">
            Counting also does not help if your basic strategy is wrong. Every basic strategy
            mistake costs more than the counting edge gives back.{' '}
            <a href="/blackjack-strategy-chart" className="text-blue-400 hover:text-blue-300 underline">
              Master basic strategy first
            </a>
            . Once your decisions are automatic, add the count.
          </p>
        </section>

        <div className="pt-8 border-t border-gray-800 flex items-center justify-between flex-wrap gap-3">
          <a href="/" className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">
            Back to Trainer
          </a>
          <a href="/blackjack-strategy-chart" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
            Basic Strategy Charts →
          </a>
          <a href="/about" className="text-gray-500 hover:text-gray-400 text-sm">
            About
          </a>
        </div>

      </div>
    </div>
  );
}
