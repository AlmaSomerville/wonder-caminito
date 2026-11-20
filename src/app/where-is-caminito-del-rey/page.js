import Link from "next/link";

export const metadata = {
  title: "Where is the Caminito del Rey? Location, map & how to get there",
  description:
    "The Caminito del Rey is in Málaga province, southern Spain — in the Desfiladero de los Gaitanes gorge between Álora, Ardales and El Chorro, about 60 km from Málaga city. How to get there by car and train, where to start, and how to visit even when official tickets are sold out.",
  alternates: { canonical: "/where-is-caminito-del-rey" },
};

const faqs = [
  ["Which city is the Caminito del Rey near?", "Málaga. The walkway is roughly 60 km northwest of Málaga city, in the municipalities of Álora, Antequera and Ardales. The nearest villages are El Chorro (south entrance / exit) and Ardales (north entrance)."],
  ["How do I get there from Málaga?", "By car: about 50–60 minutes via the A-357 towards Ardales, or towards Álora/El Chorro. By train: Renfe runs from Málaga María Zambrano to El Chorro-Caminito del Rey station; from there a shuttle bus connects to the northern entrance where the walk begins."],
  ["Where does the walk start and finish?", "You walk one way, north to south: start near Ardales (El Kiosko restaurant area) and finish in El Chorro. A shuttle bus loops between the two — it's included in our tour."],
  ["How long is it?", "About 7.7 km in total, 2.9 km of boardwalks pinned to the gorge walls, up to 105 m above the river. Allow 3–4 hours. It's a walk, not a climb — no special fitness needed, minimum age 8."],
  ["Official tickets are sold out. Can I still visit?", "Usually yes. Official guided-tour operators have separate ticket allocations from the general public website. Wonder runs the first 9AM slot with a maximum of 10 people and often has places even for the next day."],
];

export default function WhereIs() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/" className="text-[13px] font-bold opacity-60">← Wonder — Caminito del Rey</Link>
      <h1 className="mt-4 tracking-tight text-[clamp(32px,7vw,48px)] font-bold leading-tight">
        Where is the Caminito del Rey?
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed">
        The <b>Caminito del Rey</b> ("the King's little path") is in <b>Málaga province, Andalucía, southern Spain</b>.
        It runs through the <b>Desfiladero de los Gaitanes</b>, a limestone gorge up to 300 metres deep, between the
        villages of <b>Ardales</b>, <b>Álora</b> and <b>El Chorro</b> — about <b>60 km northwest of Málaga city</b> and
        around 50 minutes by car from the Costa del Sol.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed opacity-80">
        GPS for the northern access (where the walk starts): search "Caminito del Rey Acceso Norte, Ardales".
        For the southern end: "El Chorro, Álora". There's a train station at El Chorro with direct Renfe trains
        from Málaga María Zambrano.
      </p>

      <div className="mt-8 space-y-4">
        {faqs.map(([q, a]) => (
          <section key={q} className="card p-5">
            <h2 className="text-[17px] font-bold">{q}</h2>
            <p className="mt-2 text-[14px] leading-relaxed opacity-80">{a}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-rock p-7 text-sand">
        <h2 className="tracking-tight text-[24px] font-bold">Easiest way to visit: go guided, go at 9AM</h2>
        <p className="mt-2 text-[14px] leading-relaxed opacity-85">
          Official entry ticket, shuttle bus, welcome pack and an official guide who lives around the gorge —
          for €52 all inclusive. First slot of the day, max 10 people, golden light, empty boardwalks.
          Often bookable even for tomorrow.
        </p>
        <Link href="/book" className="btn btn-primary mt-5">Check dates & book</Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        }}
      />
    </main>
  );
}
