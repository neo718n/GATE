import { LegalPage } from "@/components/site/legal-page";
import { getLocale, pageMetadata } from "@/lib/i18n/server";

export const generateMetadata = () =>
  pageMetadata("/academic-integrity", {
    en: {
      title: "Academic Integrity",
      description:
        "G.A.T.E. Assessment academic integrity policy — standards of conduct, prohibited behaviors, investigation process, and consequences of misconduct.",
    },
    ru: {
      title: "Академическая честность",
      description: "Политика академической честности G.A.T.E. Assessment: стандарты поведения, запрещённые действия, порядок разбирательства и последствия нарушений.",
    },
  });

const VIOLATIONS = [
  "Receiving or providing assistance from any person or unauthorized resource during the examination",
  "Using calculators, reference materials, notes, electronic devices, or any resource not explicitly permitted",
  "Impersonation: taking the examination under another person's identity, or allowing another person to sit the examination on your behalf",
  "Sharing, disclosing, reproducing, or distributing examination questions or answers in any form — before, during, or after the examination window",
  "Submitting examination work that is not entirely your own independent effort",
  "Colluding with other participants to coordinate answers or share examination content",
  "Tampering with examination results, the scoring process, or the credential verification system",
  "Providing false identity, age, enrollment status, or institutional affiliation during registration",
  "Attempting to gain access to examination content or scoring methodologies through unauthorized means",
  "Falsifying, altering, or misrepresenting any G.A.T.E. certificate, award, or credential",
];

const CONSEQUENCES = [
  "Immediate disqualification from the current G.A.T.E. Assessment cycle, with no refund of the registration fee",
  "Cancellation and permanent revocation of any recognition, distinctions, or certificates issued in connection with the affected cycle",
  "A temporary or permanent ban from participating in future G.A.T.E. Assessment cycles, at G.A.T.E.'s sole discretion",
  "Notification of the participant's school or institution, at G.A.T.E.'s discretion, where the misconduct warrants institutional awareness",
  "Referral to relevant law enforcement or regulatory authorities where the conduct may constitute a criminal offense under applicable law",
  "Public invalidation of credentials in the G.A.T.E. verification system",
];

const SECTIONS = [
  {
    number: "01",
    title: "Our Commitment",
    content: [
      "Academic integrity is the foundation of the G.A.T.E. Assessment. The value of a G.A.T.E. certificate or recognition depends entirely on the trust that participants, institutions, universities, and academic partners place in the credibility of our process.",
      "G.A.T.E. Assessment is committed to maintaining the highest standards of fairness, transparency, and independent verification across every phase of the program. We invest in examination design, independent evaluation, and proctoring systems precisely to ensure that every result accurately reflects the individual merit of the participant.",
      "Every person who registers for and participates in the G.A.T.E. Assessment accepts a personal obligation to uphold these standards — not only because it is required, but because the integrity of the program belongs to the entire community of participants.",
    ],
  },
  {
    number: "02",
    title: "Definition of Academic Misconduct",
    content: [
      "\"Academic Misconduct\" means any act or omission — whether intentional or reckless — that provides a participant with an unfair advantage, undermines the fairness or integrity of the examination process, misrepresents the participant's independent academic work or identity, or compromises the credibility of G.A.T.E. results and credentials.",
      "The examples below are illustrative and non-exhaustive. G.A.T.E. reserves the right to determine whether specific conduct constitutes academic misconduct, applying this definition in light of the circumstances of each case.",
    ],
  },
  {
    number: "03",
    title: "Prohibited Conduct",
    content: [],
    list: VIOLATIONS,
  },
  {
    number: "04",
    title: "Detection and Monitoring",
    content: [
      "Every G.A.T.E. assessment is conducted in person at the host university and supervised throughout by G.A.T.E. staff and host-institution invigilators.",
      "G.A.T.E. employs statistical analysis of examination responses, including similarity analysis, to identify patterns that may indicate unauthorized collaboration, shared answer sets, or impersonation.",
      "Examination conditions are equivalent to formal university examination standards, including identity checks, assigned seating and the collection of all papers at the end of each session.",
      "G.A.T.E. reserves the right to investigate any submission that raises reasonable suspicion of misconduct, at any time prior to or following the publication of results.",
    ],
  },
  {
    number: "05",
    title: "Investigation Process",
    content: [
      "When G.A.T.E. has reasonable grounds to suspect academic misconduct, the following process applies:",
      "Step 1 — Notification: The participant will be notified in writing of the specific allegation, the evidence in question, and the potential consequences if the allegation is confirmed.",
      "Step 2 — Response: The participant will be given five (5) calendar days from the date of the notification to submit a written response. If no response is received within this period, G.A.T.E. will proceed on the basis of available evidence.",
      "Step 3 — Review: A designated Integrity Review Panel — composed of at least two G.A.T.E. officers with no direct involvement in the examination — will evaluate the allegation, the available evidence, and the participant's response.",
      "Step 4 — Decision: A written decision will be issued to the participant within twenty-one (21) calendar days of the response deadline. The decision will state whether misconduct has been confirmed and specify the consequences imposed.",
      "The investigation process is internal to G.A.T.E. and is not subject to external oversight or review. G.A.T.E.'s determination is final and binding, subject only to the appeals process set out in Section 07.",
    ],
  },
  {
    number: "06",
    title: "Consequences of Confirmed Misconduct",
    content: [
      "Confirmed academic misconduct may result in any or all of the following, at G.A.T.E.'s sole discretion and proportionate to the severity of the violation:",
    ],
    list: CONSEQUENCES,
  },
  {
    number: "07",
    title: "Appeals",
    content: [
      "A participant who receives a confirmed misconduct decision may submit one (1) formal written appeal within seven (7) calendar days of receiving the decision. Appeals must be submitted to: integrity@gate-assessment.org",
      "An appeal will only be considered if it presents: (a) new material evidence not previously available or considered during the investigation, or (b) a specific and substantiated procedural error that materially affected the fairness of the review process. Appeals that simply dispute the finding without meeting these criteria will not be accepted.",
      "Appeals are reviewed by a senior G.A.T.E. officer who was not involved in the original investigation. The appeal decision will be issued within fourteen (14) calendar days of receipt.",
      "The outcome of the appeal process is final. No further internal review is available. G.A.T.E. is not obligated to engage in external arbitration or litigation with respect to academic integrity decisions.",
    ],
  },
  {
    number: "08",
    title: "Reporting Suspected Violations",
    content: [
      "Any participant, parent, educator, or institution who has reasonable grounds to suspect that academic misconduct has occurred — whether by another participant or through a systemic failure — is encouraged to report it confidentially.",
      "Reports can be submitted to: integrity@gate-assessment.org",
      "All reports will be treated with strict confidentiality to the maximum extent permitted by the investigation process. G.A.T.E. will not retaliate against any individual who reports a concern in good faith. False or malicious reports made to harm another participant may themselves constitute a violation of these standards.",
    ],
  },
  {
    number: "09",
    title: "Participant Declaration",
    content: [
      "By registering for the G.A.T.E. Assessment, each participant affirms the following:",
      "I will complete the examination independently, relying solely on my own knowledge and reasoning without unauthorized assistance.",
      "I will not access, share, or distribute examination content in any form.",
      "All personal information I have provided during registration is accurate and truthful.",
      "I understand the standards of academic integrity required by G.A.T.E. Assessment, and I accept the consequences that may result from any violation.",
      "This declaration is not merely procedural — it is a personal commitment to the academic community and to all participants who take the assessment under the same conditions.",
    ],
  },
];

const SECTIONS_RU = [
  {
    number: "01",
    title: "Наши принципы",
    content: [
      "Академическая честность — основа G.A.T.E. Assessment. Ценность сертификата или награды G.A.T.E. целиком зависит от того, насколько участники, школы, университеты и академические партнёры доверяют нашей процедуре.",
      "G.A.T.E. Assessment обеспечивает высочайшие стандарты справедливости, прозрачности и независимой проверки на каждом этапе программы. Мы вкладываемся в разработку заданий, независимую проверку и системы наблюдения именно для того, чтобы каждый результат точно отражал личные заслуги участника.",
      "Каждый, кто регистрируется и участвует в G.A.T.E. Assessment, берёт на себя личное обязательство соблюдать эти стандарты — не только потому, что так требуется, но и потому, что честность программы принадлежит всему сообществу участников.",
    ],
  },
  {
    number: "02",
    title: "Что считается нарушением",
    content: [
      "«Нарушение академической честности» — любое действие или бездействие, умышленное или по небрежности, которое даёт участнику несправедливое преимущество, подрывает справедливость или честность диагностики, искажает самостоятельность работы или личность участника либо ставит под сомнение достоверность результатов и документов G.A.T.E.",
      "Приведённые ниже примеры носят иллюстративный характер, и список не является исчерпывающим. G.A.T.E. вправе определять, является ли конкретное поведение нарушением, применяя это определение с учётом обстоятельств каждого случая.",
    ],
  },
  {
    number: "03",
    title: "Запрещённые действия",
    content: [],
    list: [
      "Получение или оказание помощи со стороны любого лица или использование неразрешённых источников во время диагностики",
      "Использование калькуляторов, справочных материалов, записей, электронных устройств или любых ресурсов, которые прямо не разрешены",
      "Выдача себя за другое лицо: прохождение диагностики под чужим именем или допущение того, что кто-то проходит её за вас",
      "Передача, разглашение, воспроизведение или распространение заданий или ответов в любой форме — до, во время или после диагностики",
      "Сдача работы, выполненной не полностью самостоятельно",
      "Сговор с другими участниками для согласования ответов или обмена заданиями",
      "Вмешательство в результаты, процедуру оценивания или систему проверки документов",
      "Указание ложных сведений о личности, возрасте, месте учёбы или учебном заведении при регистрации",
      "Попытки получить доступ к заданиям или методике оценивания недозволенными способами",
      "Подделка, изменение или искажение любого сертификата, награды или документа G.A.T.E.",
    ],
  },
  {
    number: "04",
    title: "Выявление и контроль",
    content: [
      "Каждая диагностика G.A.T.E. проводится очно в принимающем университете — под постоянным наблюдением сотрудников G.A.T.E. и экзаменаторов принимающего учреждения.",
      "G.A.T.E. применяет статистический анализ ответов, включая анализ сходства, чтобы выявлять признаки несанкционированного сотрудничества, совпадающих наборов ответов или подмены участника.",
      "Условия соответствуют стандартам официальных университетских экзаменов: проверка личности, закреплённые места и сбор всех работ по окончании каждой сессии.",
      "G.A.T.E. вправе в любой момент — до или после публикации результатов — провести проверку любой работы, если есть обоснованные подозрения в нарушении.",
    ],
  },
  {
    number: "05",
    title: "Порядок разбирательства",
    content: [
      "Если у G.A.T.E. есть обоснованные подозрения в нарушении академической честности, применяется следующий порядок:",
      "Шаг 1 — Уведомление. Участник получает письменное уведомление с описанием конкретного нарушения, имеющихся доказательств и возможных последствий в случае его подтверждения.",
      "Шаг 2 — Объяснение. У участника есть пять (5) календарных дней с даты уведомления, чтобы направить письменное объяснение. Если объяснение не поступило в этот срок, G.A.T.E. принимает решение на основании имеющихся доказательств.",
      "Шаг 3 — Рассмотрение. Комиссия по академической честности — не менее двух сотрудников G.A.T.E., не участвовавших в проведении диагностики, — изучает обвинение, доказательства и объяснение участника.",
      "Шаг 4 — Решение. Участник получает письменное решение в течение двадцати одного (21) календарного дня после истечения срока для объяснения. В решении указывается, подтверждено ли нарушение и какие меры применены.",
      "Разбирательство проводится внутри G.A.T.E. и не подлежит внешнему контролю или пересмотру. Решение G.A.T.E. окончательно и обязательно и может быть обжаловано только в порядке, описанном в разделе 07.",
    ],
  },
  {
    number: "06",
    title: "Последствия подтверждённого нарушения",
    content: [
      "Подтверждённое нарушение может повлечь любые или все из перечисленных мер — по усмотрению G.A.T.E. и соразмерно тяжести нарушения:",
    ],
    list: [
      "Немедленная дисквалификация из текущего цикла G.A.T.E. Assessment без возврата регистрационного взноса",
      "Аннулирование и бессрочный отзыв всех наград, отличий и сертификатов, выданных в рамках соответствующего цикла",
      "Временный или бессрочный запрет на участие в будущих циклах G.A.T.E. Assessment по усмотрению G.A.T.E.",
      "Уведомление школы или учебного заведения участника, если, по мнению G.A.T.E., характер нарушения этого требует",
      "Передача информации в правоохранительные или надзорные органы, если действия могут являться преступлением по применимому законодательству",
      "Публичное аннулирование документов в системе проверки G.A.T.E.",
    ],
  },
  {
    number: "07",
    title: "Обжалование",
    content: [
      "Участник, в отношении которого вынесено решение о подтверждённом нарушении, может подать одну (1) официальную письменную апелляцию в течение семи (7) календарных дней с момента получения решения. Апелляции направляются на integrity@gate-assessment.org",
      "Апелляция рассматривается, только если в ней представлены: (а) новые существенные доказательства, которые не были доступны или не учитывались при разбирательстве, или (б) конкретная и обоснованная процедурная ошибка, существенно повлиявшая на справедливость рассмотрения. Апелляции, в которых решение просто оспаривается без соблюдения этих критериев, не принимаются.",
      "Апелляцию рассматривает старший сотрудник G.A.T.E., не участвовавший в первоначальном разбирательстве. Решение по апелляции выносится в течение четырнадцати (14) календарных дней с момента её получения.",
      "Решение по апелляции окончательно, дальнейший внутренний пересмотр невозможен. G.A.T.E. не обязан участвовать во внешнем арбитраже или судебных разбирательствах в отношении решений об академической честности.",
    ],
  },
  {
    number: "08",
    title: "Как сообщить о нарушении",
    content: [
      "Если у участника, родителя, педагога или учебного заведения есть обоснованные подозрения в нарушении академической честности — со стороны другого участника или из-за системного сбоя, — мы просим конфиденциально сообщить об этом.",
      "Сообщения принимаются по адресу integrity@gate-assessment.org",
      "Все сообщения рассматриваются строго конфиденциально в максимально возможной для разбирательства степени. G.A.T.E. не допускает никаких ответных мер против тех, кто добросовестно сообщил о проблеме. Заведомо ложные сообщения с целью навредить другому участнику сами по себе могут быть нарушением настоящих стандартов.",
    ],
  },
  {
    number: "09",
    title: "Заявление участника",
    content: [
      "Регистрируясь в G.A.T.E. Assessment, каждый участник подтверждает:",
      "Я выполню задания самостоятельно, опираясь только на собственные знания и рассуждения, без недозволенной помощи.",
      "Я не буду получать доступ к заданиям, передавать или распространять их в какой-либо форме.",
      "Все личные сведения, которые я указал(а) при регистрации, точны и достоверны.",
      "Я понимаю требования G.A.T.E. Assessment к академической честности и принимаю последствия, которые может повлечь любое нарушение.",
      "Это заявление — не формальность, а личное обязательство перед академическим сообществом и всеми, кто проходит диагностику в тех же условиях.",
    ],
  },
];

export default async function AcademicIntegrityPage() {
  if ((await getLocale()) === "ru") {
    return (
      <LegalPage
        title="Академическая честность"
        updated="Редакция: ноябрь 2026 · G.A.T.E. Assessment"
        intro="Политика академической честности G.A.T.E. Assessment определяет стандарты поведения для всех участников, действия, которые считаются нарушением, порядок разбирательства и последствия подтверждённых нарушений. Согласие с этими стандартами — обязательное условие регистрации."
        sections={SECTIONS_RU}
      />
    );
  }
  return (
    <LegalPage
      title="Academic Integrity"
      updated="Updated: November 2026 · G.A.T.E. Assessment"
      intro="The G.A.T.E. Assessment Academic Integrity Policy sets out the standards of conduct required of all participants, the behaviors that constitute academic misconduct, the process by which allegations are investigated, and the consequences of confirmed violations. Acceptance of these standards is a condition of registration."
      sections={SECTIONS}
    />
  );
}
