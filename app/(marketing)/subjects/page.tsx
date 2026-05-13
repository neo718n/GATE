import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Subject Areas",
  description:
    "Explore the six academic disciplines in the G.A.T.E. Assessment: Mathematics, Physics, Chemistry, Biology, Competitive Programming, and English.",
};

const SUBJECTS = [
  {
    code: "MAT",
    name: "Mathematics",
    description:
      "Advanced problem solving across algebra, combinatorics, number theory, geometry, and mathematical analysis. Problems emphasize rigorous proof and creative reasoning.",
    topics: ["Algebra & Number Theory", "Combinatorics", "Geometry", "Real Analysis", "Mathematical Proof"],
  },
  {
    code: "PHY",
    name: "Physics",
    description:
      "Classical and modern physics from mechanics and thermodynamics to electromagnetism and quantum foundations. Both theoretical derivation and numerical problem-solving are tested.",
    topics: ["Mechanics & Dynamics", "Electromagnetism", "Thermodynamics", "Waves & Optics", "Modern Physics"],
  },
  {
    code: "CHM",
    name: "Chemistry",
    description:
      "Theoretical chemistry spanning physical, organic, and inorganic domains. Emphasis on chemical reasoning, reaction mechanisms, and thermodynamic principles.",
    topics: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Reaction Kinetics", "Thermochemistry"],
  },
  {
    code: "BIO",
    name: "Biology",
    description:
      "Theoretical biology from molecular and cellular mechanisms to ecology and evolution. Questions test conceptual depth and the ability to synthesize across levels of biological organization.",
    topics: ["Cell & Molecular Biology", "Genetics & Evolution", "Physiology", "Ecology", "Biochemistry"],
  },
  {
    code: "CP",
    name: "Competitive Programming",
    description:
      "Algorithmic problem solving under time pressure — designing efficient solutions across data structures, graph theory, dynamic programming, and combinatorics. Problems reward both correctness and performance.",
    topics: ["Data Structures & Algorithms", "Dynamic Programming", "Graph Theory", "Combinatorics", "String Algorithms"],
  },
  {
    code: "ENG",
    name: "English",
    description:
      "Academic English proficiency encompassing reading comprehension, analytical writing, and linguistic reasoning. Participants demonstrate command of language structure, argumentation, and critical interpretation of texts.",
    topics: ["Reading Comprehension", "Academic Writing", "Grammar & Linguistics", "Critical Analysis", "Vocabulary & Usage"],
  },
];

export default function SubjectsPage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Academic Disciplines
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">
            Subject Areas
          </h1>
          <p className="text-base font-light text-gate-800/65 leading-relaxed max-w-2xl mt-2">
            G.A.T.E. spans six rigorous academic disciplines. Participants
            register in one subject area and are evaluated through theoretical
            examinations designed by leading academics.
          </p>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="py-20 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {SUBJECTS.map((subject) => (
            <div
              key={subject.code}
              className="flex flex-col gap-5 border border-gate-fog bg-gate-fog/40 p-8 hover:bg-gate-fog/70 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-[0.3em] text-gate-gold">
                    {subject.code}
                  </span>
                  <h2 className="font-serif text-2xl font-light text-gate-800">
                    {subject.name}
                  </h2>
                </div>
              </div>
              <p className="text-sm font-light text-gate-800/65 leading-relaxed flex-1">
                {subject.description}
              </p>
              <div className="flex flex-col gap-3 pt-4 border-t border-gate-fog/60">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gray">
                  Key Topics
                </span>
                <ul className="flex flex-col gap-2">
                  {subject.topics.map((topic) => (
                    <li key={topic} className="flex items-center gap-2 text-xs font-light text-gate-800/65">
                      <span className="h-px w-4 bg-gate-gold/40 shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Note */}
      <section className="py-20 px-6 border-t border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Registration
          </span>
          <h2 className="font-serif text-4xl font-light text-gate-800">
            Choose Your Discipline
          </h2>
          <p className="text-sm font-light text-gate-800/65 leading-relaxed">
            Each participant registers in a single subject area for the
            Preliminary Round. Your subject selection is made during the
            application process and cannot be changed after submission.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">Apply Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/structure">View Assessment Structure</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

