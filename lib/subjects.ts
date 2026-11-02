// The five G.A.T.E. disciplines, shared by /subjects and the 3D subject stage.

export type SubjectKey = "math" | "english" | "physics" | "chemistry" | "informatics";

export type Subject = {
  key: SubjectKey;
  code: string;
  name: string;
  tagline: string;
  description: string;
  topics: string[];
};

export const SUBJECTS: Subject[] = [
  {
    key: "math",
    code: "MAT",
    name: "Mathematics",
    tagline: "Structure, proof and creative reasoning",
    description:
      "Advanced problem solving across algebra, combinatorics, number theory, geometry, and mathematical analysis. Problems emphasize rigorous proof and creative reasoning.",
    topics: ["Algebra & Number Theory", "Combinatorics", "Geometry", "Real Analysis", "Mathematical Proof"],
  },
  {
    key: "english",
    code: "ENG",
    name: "English",
    tagline: "Language as a tool for thinking",
    description:
      "Academic English proficiency encompassing reading comprehension, analytical writing, and linguistic reasoning. Participants demonstrate command of language structure, argumentation, and critical interpretation of texts.",
    topics: ["Reading Comprehension", "Academic Writing", "Grammar & Linguistics", "Critical Analysis", "Vocabulary & Usage"],
  },
  {
    key: "physics",
    code: "PHY",
    name: "Physics",
    tagline: "From mechanics to the quantum world",
    description:
      "Classical and modern physics from mechanics and thermodynamics to electromagnetism and quantum foundations. Both theoretical derivation and numerical problem-solving are tested.",
    topics: ["Mechanics & Dynamics", "Electromagnetism", "Thermodynamics", "Waves & Optics", "Modern Physics"],
  },
  {
    key: "chemistry",
    code: "CHM",
    name: "Chemistry",
    tagline: "How matter is built and transformed",
    description:
      "Theoretical chemistry spanning physical, organic, and inorganic domains. Emphasis on chemical reasoning, reaction mechanisms, and thermodynamic principles.",
    topics: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Reaction Kinetics", "Thermochemistry"],
  },
  {
    key: "informatics",
    code: "INF",
    name: "Informatics",
    tagline: "Algorithms that scale",
    description:
      "Algorithmic thinking and problem solving — designing efficient solutions across data structures, graph theory, dynamic programming, and combinatorics. Problems reward both correctness and performance.",
    topics: ["Data Structures & Algorithms", "Dynamic Programming", "Graph Theory", "Combinatorics", "String Algorithms"],
  },
];

const SUBJECTS_RU: Record<SubjectKey, Pick<Subject, "name" | "tagline" | "description" | "topics">> = {
  math: {
    name: "Математика",
    tagline: "Структура, доказательство и творческое мышление",
    description:
      "Нестандартные задачи по алгебре, комбинаторике, теории чисел, геометрии и математическому анализу. Здесь ценится строгое доказательство и оригинальный ход мысли.",
    topics: ["Алгебра и теория чисел", "Комбинаторика", "Геометрия", "Математический анализ", "Доказательства"],
  },
  english: {
    name: "Английский язык",
    tagline: "Язык как инструмент мышления",
    description:
      "Академический английский: понимание текста, аналитическое письмо и языковая логика. Участник показывает, как владеет структурой языка, умеет аргументировать и критически читать.",
    topics: ["Чтение и понимание", "Академическое письмо", "Грамматика и лингвистика", "Критический анализ", "Лексика"],
  },
  physics: {
    name: "Физика",
    tagline: "От механики до квантового мира",
    description:
      "Классическая и современная физика — от механики и термодинамики до электромагнетизма и основ квантовой теории. Проверяется и умение выводить формулы, и умение считать.",
    topics: ["Механика и динамика", "Электромагнетизм", "Термодинамика", "Волны и оптика", "Современная физика"],
  },
  chemistry: {
    name: "Химия",
    tagline: "Как устроено и превращается вещество",
    description:
      "Теоретическая химия: физическая, органическая и неорганическая. Главное — химическая логика, механизмы реакций и законы термодинамики.",
    topics: ["Физическая химия", "Органическая химия", "Неорганическая химия", "Кинетика реакций", "Термохимия"],
  },
  informatics: {
    name: "Информатика",
    tagline: "Алгоритмы, которые масштабируются",
    description:
      "Алгоритмическое мышление и решение задач: структуры данных, теория графов, динамическое программирование и комбинаторика. Важны и правильность, и эффективность решения.",
    topics: ["Структуры данных и алгоритмы", "Динамическое программирование", "Теория графов", "Комбинаторика", "Строковые алгоритмы"],
  },
};

/** Subjects with display text in the given language (`key`/`code` unchanged). */
export function getSubjects(locale: "en" | "ru"): Subject[] {
  return locale === "ru" ? SUBJECTS.map((s) => ({ ...s, ...SUBJECTS_RU[s.key] })) : SUBJECTS;
}
