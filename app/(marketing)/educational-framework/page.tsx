import { FaqAccordion } from "@/components/site/faq-accordion";
import { ButtonLink, PageHero, Section, SectionHeader } from "@/components/site/kit";
import { Reveal } from "@/components/site/motion/reveal";
import { getLocale, pageMetadata } from "@/lib/i18n/server";

export const generateMetadata = () =>
  pageMetadata("/educational-framework", {
    en: {
      title: "Educational Framework",
      description: "G.A.T.E. Educational Assessment Framework — diagnostic evaluation program for academic growth and individual performance analysis.",
    },
    ru: {
      title: "Образовательная концепция",
      description: "Образовательная концепция G.A.T.E.: диагностическая программа для академического роста и анализа индивидуальных результатов.",
    },
  });

// Anchor ids stay in English so links work in both languages.
const SECTION_IDS = ["educational-philosophy", "china-regulatory-compliance", "assessment-structure"];

const T = {
  en: {
    faqs: [
      {
        section: "Educational Philosophy",
        items: [
          { q: "Is G.A.T.E. a competition or olympiad?", a: "No. G.A.T.E. is a diagnostic educational assessment program designed to evaluate individual academic performance and provide detailed feedback for growth. Unlike competitions where participants are ranked against each other to determine winners and losers, our program focuses on individual skill assessment and personalized performance reports. Every participant receives a Certificate of Completion and a detailed diagnostic report regardless of their performance level." },
          { q: "What is the purpose of this assessment?", a: "The purpose is threefold: (1) to provide students with an objective diagnostic evaluation of their academic skills in specific subject areas, (2) to offer detailed performance reports identifying strengths and areas for improvement, and (3) to recognize outstanding academic achievement through certificates of distinction. This is an educational tool for growth, not a competitive ranking system." },
          { q: "How does this differ from academic competitions?", a: "Traditional academic competitions focus on ranking participants, determining winners, and awarding prizes based on relative performance. G.A.T.E. is structured as a diagnostic assessment where each participant is evaluated against established academic standards, not against other participants. There are no 'winners' or 'losers' — only individuals receiving personalized feedback on their academic proficiency." },
          { q: "What do participants receive?", a: "All participants receive: (1) a Certificate of Completion documenting their participation, (2) a detailed performance report analyzing their responses and identifying strengths and growth areas, and (3) if performance meets established academic standards, additional recognition certificates (Certificate of Distinction, Certificate of High Achievement, or Certificate of Merit). These are academic credentials, not competition prizes." },
        ],
      },
      {
        section: "China Regulatory Compliance",
        items: [
          { q: "Can students from China participate?", a: "Yes. Students from China and all other countries are eligible to participate in G.A.T.E. as an educational assessment program. Participation is voluntary, and the program is designed to complement formal education through diagnostic feedback and skill evaluation. Parents and students should review local education policies, but our program structure aligns with educational assessment frameworks rather than competitive olympiad models." },
          { q: "Does this program provide admission advantages or recruitment linkages?", a: "No. G.A.T.E. does not coordinate with universities for admissions, does not provide recruitment pathways, and does not guarantee admission advantages. Certificates of distinction are academic credentials documenting individual achievement, similar to course completion certificates or standardized test score reports. How universities or institutions evaluate these credentials is at their independent discretion — we do not manage or influence admission processes." },
          { q: "What is the legal basis for this program?", a: "G.A.T.E. operates as an international educational services provider offering diagnostic assessment programs. The program structure follows established educational assessment frameworks used globally by organizations such as PISA (OECD), TIMSS, and Cambridge Assessment. Our legal framework is based on providing educational diagnostic services, not organizing competitive events. Participants engage voluntarily for self-assessment and skill development purposes." },
        ],
      },
      {
        section: "Assessment Structure",
        items: [
          { q: "How are performance levels determined?", a: "Performance is evaluated against pre-established academic standards and rubrics developed by subject-matter experts. The assessment measures proficiency in theoretical knowledge, analytical reasoning, and problem-solving methodology. Performance levels (Distinction, High Achievement, Merit) are determined by whether responses meet specific quality and accuracy thresholds — not by ranking relative to other participants." },
          { q: "Are results compared between participants?", a: "No. While aggregate anonymized data may be used for program improvement and statistical analysis, individual results are not compared for ranking purposes. Each participant's performance is evaluated independently against the academic standards. Certificates of distinction reflect individual achievement of high academic standards, not competitive ranking." },
          { q: "What subjects are assessed?", a: "G.A.T.E. offers diagnostic assessments in multiple academic disciplines including Mathematics, English, Physics, Chemistry and Informatics. Each assessment is calibrated to the participant's grade band (Grades 1–12). Participants select a single subject area during registration based on their academic interests and strengths." },
          { q: "Is this program accredited?", a: "G.A.T.E. is an independent educational assessment program. While we are not an accredited examination board like Cambridge or IB, our assessment framework follows internationally recognized standards for academic evaluation. Certificates issued document participation and individual performance in a structured diagnostic assessment — they are academic credentials, not formal qualifications or degree prerequisites." },
        ],
      },
    ],
    heroEyebrow: "Educational framework",
    heroTitle: "Diagnostic assessment, not a competition",
    heroLead:
      "G.A.T.E. is an educational assessment program designed for diagnostic evaluation and academic growth. Every participant receives personalized feedback and certification documenting their individual academic performance.",
    statementEyebrow: "Non-competitive positioning",
    statementTitle: "Official statement",
    p1a: "The Global Academic & Theoretical Excellence (G.A.T.E.) program is a ",
    p1b: "diagnostic educational assessment framework",
    p1c: ", not an academic competition or olympiad. Our mission is to provide students worldwide with objective evaluation of their academic skills and detailed performance feedback for educational growth.",
    p2: "Unlike competitive olympiad programs that rank participants to determine winners and award competitive prizes, G.A.T.E. evaluates each participant individually against established academic standards. There are no winners or losers — every participant receives a Certificate of Completion, a detailed diagnostic report, and recognition certificates if their performance meets academic distinction thresholds.",
    p3: "This program structure complies with international educational assessment frameworks and aligns with regulatory guidance in jurisdictions that distinguish between competitive academic events and diagnostic educational programs. Participation is voluntary, assessment-focused, and designed to complement formal education through skill evaluation and personalized feedback.",
    ctaTitle: "Questions about our framework?",
    ctaLead: "Our team is available to answer questions regarding the assessment structure, compliance framework, or participation process.",
    contact: "Contact us",
    about: "About G.A.T.E.",
  },
  ru: {
    faqs: [
      {
        section: "Образовательная философия",
        items: [
          { q: "G.A.T.E. — это соревнование или олимпиада?", a: "Нет. G.A.T.E. — образовательная диагностическая программа: мы оцениваем индивидуальные академические результаты и даём подробную обратную связь для роста. В отличие от соревнований, где участников ранжируют, чтобы определить победителей и проигравших, наша программа сосредоточена на оценке навыков каждого и персональных отчётах. Каждый участник, независимо от результата, получает сертификат участника и подробный диагностический отчёт." },
          { q: "Зачем нужна эта диагностика?", a: "У неё три задачи: (1) дать школьникам объективную оценку их знаний по конкретным предметам, (2) предоставить подробный отчёт с сильными сторонами и зонами роста, (3) отметить выдающиеся академические достижения сертификатами. Это образовательный инструмент для развития, а не система соревновательного рейтинга." },
          { q: "Чем это отличается от предметных соревнований?", a: "Классические предметные соревнования строятся на рейтинге: определяют победителей и вручают призы по относительным результатам. G.A.T.E. устроен как диагностика, где каждого участника оценивают по установленным академическим стандартам, а не в сравнении с другими. Здесь нет «победителей» и «проигравших» — каждый получает персональную обратную связь о своём уровне." },
          { q: "Что получают участники?", a: "Все участники получают: (1) сертификат участника, (2) подробный отчёт с разбором ответов, сильных сторон и зон роста, (3) если результаты соответствуют установленным стандартам, — дополнительные сертификаты (Certificate of Distinction, Certificate of High Achievement или Certificate of Merit). Это академические документы, а не призы соревнования." },
        ],
      },
      {
        section: "Соответствие требованиям Китая",
        items: [
          { q: "Могут ли участвовать школьники из Китая?", a: "Да. Школьники из Китая и любых других стран могут участвовать в G.A.T.E. как в образовательной диагностической программе. Участие добровольное, а сама программа дополняет школьное образование за счёт диагностики и оценки навыков. Родителям и ученикам стоит ознакомиться с местными правилами в сфере образования, но структура нашей программы соответствует моделям образовательной диагностики, а не соревновательных олимпиад." },
          { q: "Даёт ли программа преимущества при поступлении?", a: "Нет. G.A.T.E. не взаимодействует с университетами по вопросам приёма, не предлагает каналов зачисления и не гарантирует преимуществ при поступлении. Сертификаты — это академические документы о личных достижениях, подобные сертификатам об окончании курса или отчётам о результатах стандартизированных тестов. Как их оценивать, университеты и учреждения решают самостоятельно — мы не управляем процессом приёма и не влияем на него." },
          { q: "На каком правовом основании работает программа?", a: "G.A.T.E. работает как международный поставщик образовательных услуг, предлагающий диагностические программы. Структура программы следует признанным моделям образовательной оценки, которые применяют PISA (ОЭСР), TIMSS и Cambridge Assessment. Наша правовая основа — оказание образовательных диагностических услуг, а не организация соревнований. Участники приходят добровольно — чтобы оценить себя и развить навыки." },
        ],
      },
      {
        section: "Структура диагностики",
        items: [
          { q: "Как определяются уровни результатов?", a: "Результаты оцениваются по заранее установленным академическим стандартам и критериям, которые разработали эксперты по предметам. Диагностика измеряет теоретические знания, аналитическое мышление и умение решать задачи. Уровень (Distinction, High Achievement, Merit) зависит от того, достигают ли ответы определённых порогов качества и точности, а не от места относительно других участников." },
          { q: "Сравниваются ли результаты участников между собой?", a: "Нет. Обезличенные сводные данные могут использоваться для статистики и развития программы, но индивидуальные результаты не сравниваются ради рейтинга. Работа каждого участника оценивается независимо по академическим стандартам. Сертификаты отражают личное достижение высоких стандартов, а не место в рейтинге." },
          { q: "По каким предметам проводится диагностика?", a: "G.A.T.E. проводит диагностику по нескольким дисциплинам: математике, английскому языку, физике, химии и информатике. Задания подбираются под возрастную группу участника (1–12 классы). При регистрации участник выбирает один предмет — исходя из своих интересов и сильных сторон." },
          { q: "Аккредитована ли программа?", a: "G.A.T.E. — независимая образовательная диагностическая программа. Мы не являемся аккредитованной экзаменационной организацией, как Cambridge или IB, но наша система оценки следует международно признанным стандартам. Сертификаты подтверждают участие и индивидуальные результаты в структурированной диагностике — это академические документы, а не официальная квалификация или условие для получения диплома." },
        ],
      },
    ],
    heroEyebrow: "Образовательная концепция",
    heroTitle: "Диагностика, а не соревнование",
    heroLead:
      "G.A.T.E. — образовательная программа для диагностики и академического роста. Каждый участник получает персональную обратную связь и сертификат, подтверждающий его индивидуальные результаты.",
    statementEyebrow: "Не соревновательный формат",
    statementTitle: "Официальное заявление",
    p1a: "Программа Global Academic & Theoretical Excellence (G.A.T.E.) — это ",
    p1b: "система образовательной диагностики",
    p1c: ", а не предметное соревнование или олимпиада. Наша миссия — дать школьникам по всему миру объективную оценку их знаний и подробную обратную связь для дальнейшего роста.",
    p2: "В отличие от олимпиад, где участников ранжируют, чтобы определить победителей и вручить призы, G.A.T.E. оценивает каждого индивидуально по установленным академическим стандартам. Здесь нет победителей и проигравших: каждый получает сертификат участника, подробный диагностический отчёт и дополнительные сертификаты, если его результаты достигают академических порогов.",
    p3: "Структура программы соответствует международным моделям образовательной диагностики и согласуется с регуляторными требованиями в юрисдикциях, где различают соревновательные мероприятия и диагностические образовательные программы. Участие добровольное, нацелено на диагностику и дополняет школьное образование за счёт оценки навыков и персональной обратной связи.",
    ctaTitle: "Остались вопросы о нашей концепции?",
    ctaLead: "Наша команда ответит на вопросы о структуре диагностики, соответствии требованиям и порядке участия.",
    contact: "Связаться с нами",
    about: "О G.A.T.E.",
  },
};

export default async function EducationalFrameworkPage() {
  const t = T[await getLocale()];
  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle} lead={t.heroLead} />

      <Section tone="ivory">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <SectionHeader align="left" eyebrow={t.statementEyebrow} title={t.statementTitle} className="mb-0 md:mb-0" />
          <Reveal className="glass flex flex-col gap-5 rounded-[2rem] p-8 text-[15px] leading-[1.9] text-ink-2 md:p-10">
            <p>
              {t.p1a}
              <strong className="font-semibold text-ink">{t.p1b}</strong>
              {t.p1c}
            </p>
            <p>{t.p2}</p>
            <p>{t.p3}</p>
          </Reveal>
        </div>
      </Section>

      {t.faqs.map((section, i) => (
        <Section key={SECTION_IDS[i]} id={SECTION_IDS[i]} tone={i % 2 === 0 ? "ivory-2" : "ivory"}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <SectionHeader align="left" eyebrow={`0${i + 1}`} title={section.section} className="mb-0 md:mb-0" />
            <Reveal>
              <FaqAccordion items={section.items} />
            </Reveal>
          </div>
        </Section>
      ))}

      <Section tone="ivory-2">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-3xl font-serif text-4xl font-medium leading-[1.05] text-ink md:text-6xl">{t.ctaTitle}</h2>
          <p className="max-w-xl text-base leading-[1.8] text-ink-2">{t.ctaLead}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact">{t.contact}</ButtonLink>
            <ButtonLink href="/about" variant="outline">
              {t.about}
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
