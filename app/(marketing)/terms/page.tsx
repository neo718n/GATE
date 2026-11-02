import { LegalPage } from "@/components/site/legal-page";
import { getLocale, pageMetadata } from "@/lib/i18n/server";

export const generateMetadata = () =>
  pageMetadata("/terms", {
    en: {
      title: "Terms of Participation",
      description:
        "G.A.T.E. Assessment terms of participation — binding agreement governing registration, fees, conduct, liability, and program participation.",
    },
    ru: {
      title: "Условия участия",
      description: "Условия участия в G.A.T.E. Assessment: регистрация, взносы, правила поведения, ответственность и участие в программе.",
    },
  });

const SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms",
    content: [
      "These Terms of Participation (\"Terms\") constitute a legally binding agreement between you (\"Participant\") and G.A.T.E. Assessment (\"G.A.T.E.\", \"we\", \"us\") governing your registration for and participation in the G.A.T.E. Assessment program.",
      "By completing the registration process, you confirm that you have read, understood, and agree to be bound by these Terms in their entirety, including the Rules & Regulations, Privacy Policy, and Academic Integrity Policy incorporated by reference.",
      "If you are under the age of 18, your parent or legal guardian must review and accept these Terms on your behalf. By submitting a registration for a minor, the parent or guardian confirms their unconditional acceptance of these Terms.",
      "If you do not agree to these Terms, you must not register for or participate in the G.A.T.E. Assessment.",
    ],
  },
  {
    number: "02",
    title: "Registration and Fees",
    content: [
      "Registration is open to eligible participants during the published registration period through the official G.A.T.E. platform. G.A.T.E. reserves the right to close, extend, or modify the registration period at its sole discretion.",
      "Registration fees are published on the G.A.T.E. platform at the time of application and are denominated in the currency specified. Fees may vary by country of registration. All fees are payable in full at the time of registration.",
      "All registration fees are strictly non-refundable. No refund will be issued under any circumstances, including but not limited to: voluntary withdrawal from the program; failure to meet eligibility requirements discovered after registration; disqualification for any reason; inability to attend the program due to illness, travel disruption, or personal circumstances; visa denial or travel restriction; technical failure by the participant; program rescheduling, modification, or cancellation by G.A.T.E.; or force majeure events.",
      "G.A.T.E. reserves the right to modify the fee structure for future assessment cycles without notice.",
    ],
  },
  {
    number: "03",
    title: "Participant Obligations",
    content: [
      "You agree to provide accurate, complete, and truthful information at the time of registration and throughout your participation. Knowingly providing false or misleading information — including regarding your identity, age, enrollment status, or institutional affiliation — constitutes a material breach of these Terms and grounds for immediate disqualification.",
      "You are responsible for arriving at the host university on the published program dates and for following the program schedule, the instructions of G.A.T.E. staff and the rules of the host institution throughout your stay.",
      "The program fee covers only the items listed as included on the program's page. You are solely responsible for all other costs, including international airfare, visa fees and travel insurance. G.A.T.E. may issue supporting documentation letters upon request but provides no financial assistance for travel.",
      "You agree to comply with all applicable examination rules, instructions, and the G.A.T.E. Code of Conduct at all times.",
    ],
  },
  {
    number: "04",
    title: "Visa, Travel, and Entry",
    content: [
      "Registered participants are solely responsible for obtaining all travel documentation necessary to enter the host country of their program, including any required visas, passport validity requirements, and health documentation.",
      "G.A.T.E. will issue an official invitation letter to registered participants upon request to support visa applications. The issuance of an invitation letter does not constitute a guarantee of visa approval by any governmental authority.",
      "A visa denial, travel restriction, illness, or any other circumstance preventing a registered participant from attending the program does not entitle the participant to a refund of the registration fee, an alternative assessment pathway, or any form of compensation.",
      "G.A.T.E. is not responsible for costs incurred in connection with travel arrangements that cannot be fulfilled due to program modification, postponement, or cancellation.",
    ],
  },
  {
    number: "05",
    title: "Intellectual Property",
    content: [
      "All examination content — including questions, problems, answer structures, scoring criteria, and assessment methodologies — is the exclusive intellectual property of G.A.T.E. Assessment. All rights are reserved.",
      "Participants must not reproduce, photograph, record, transcribe, share, publish, or distribute any examination content in any form or medium, whether during or after the examination period. Violation constitutes both academic misconduct and an infringement of G.A.T.E.'s intellectual property rights.",
      "Certificates issued to participants are provided for personal use and recognition only. G.A.T.E. retains the right to verify the authenticity of all credentials and to revoke certificates in cases of fraud, misconduct, or material breach of these Terms.",
      "Examination responses and answer submissions become the property of G.A.T.E. and may be retained, reviewed, and used for the purposes of scoring, quality assurance, academic research, and program improvement, without additional compensation to the participant.",
    ],
  },
  {
    number: "06",
    title: "Media Consent",
    content: [
      "By registering for and attending a G.A.T.E. program, participants (and, where applicable, their parents or guardians on their behalf) consent to being photographed, filmed, or recorded at G.A.T.E. events and at the host venue.",
      "G.A.T.E. may use such photographs, video recordings, or audio recordings for educational, promotional, and informational purposes — including on the G.A.T.E. website, social media channels, and official publications — without additional compensation.",
      "Participants who do not wish to be photographed or filmed must notify G.A.T.E. in writing at least fourteen (14) days before the event. G.A.T.E. will make reasonable efforts to accommodate such requests, but cannot guarantee exclusion from all incidental coverage.",
    ],
  },
  {
    number: "07",
    title: "Limitation of Liability",
    content: [
      "To the maximum extent permitted by applicable law, G.A.T.E. Assessment, its officers, employees, partners, agents, and affiliates shall not be liable for: any indirect, incidental, special, consequential, exemplary, or punitive damages; loss of data, revenue, opportunity, or goodwill; personal injury or property damage arising during travel to or from any G.A.T.E. event; or any other loss or damage arising from or in connection with your participation in the G.A.T.E. Assessment.",
      "G.A.T.E. is not liable for examination disruptions, platform outages, data transmission failures, or assessment errors caused by circumstances beyond its reasonable control.",
      "G.A.T.E.'s total aggregate liability to any individual participant — for any claim, regardless of the form of action — shall not exceed the amount of the registration fee actually paid by that participant.",
      "Nothing in these Terms limits liability for death or personal injury caused by G.A.T.E.'s gross negligence or fraud, to the extent such limitation is prohibited by applicable law.",
    ],
  },
  {
    number: "08",
    title: "Indemnification",
    content: [
      "You agree to indemnify, defend, and hold harmless G.A.T.E. Assessment, its officers, employees, partners, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or relating to: your breach of these Terms; your violation of any applicable law or regulation; your academic misconduct or fraudulent conduct; any misrepresentation made by you during registration or participation; or any third-party claim arising from your participation in the G.A.T.E. Assessment.",
    ],
  },
  {
    number: "09",
    title: "Force Majeure",
    content: [
      "G.A.T.E. shall not be in breach of these Terms, nor liable for any failure or delay in performing any obligation, if such failure or delay results from circumstances beyond G.A.T.E.'s reasonable control, including but not limited to: natural disasters; epidemic or pandemic; acts of terrorism or war; governmental orders, sanctions, or travel restrictions; severe weather events; or any other event of force majeure.",
      "In such circumstances, G.A.T.E. may, at its sole discretion, modify, postpone, reformat, or cancel the assessment program without liability to participants. Registration fees will not be refunded unless G.A.T.E. expressly states otherwise in writing.",
    ],
  },
  {
    number: "10",
    title: "Governing Law and Dispute Resolution",
    content: [
      "These Terms shall be governed by and construed in accordance with the general principles of international commercial contract law, as may be supplemented by the laws of the jurisdiction in which G.A.T.E. Assessment is registered.",
      "In the event of any dispute arising from or in connection with these Terms or your participation in the G.A.T.E. Assessment, the parties agree to first attempt to resolve the dispute through good-faith negotiation by contacting info@gate-assessment.org.",
      "If the dispute cannot be resolved amicably within thirty (30) days, it shall be submitted to binding arbitration under the rules of a recognized international arbitration body mutually agreed upon by the parties. Each party shall bear its own costs unless the arbitrator awards otherwise.",
      "You expressly waive any right to participate in any class action, class arbitration, or representative proceeding against G.A.T.E. Assessment.",
    ],
  },
  {
    number: "11",
    title: "Severability and Entire Agreement",
    content: [
      "If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court or arbitrator of competent jurisdiction, such provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.",
      "These Terms, together with the Rules & Regulations, Privacy Policy, and Academic Integrity Policy, constitute the entire agreement between you and G.A.T.E. Assessment with respect to your participation in the program and supersede all prior agreements, representations, and understandings.",
    ],
  },
  {
    number: "12",
    title: "Modifications",
    content: [
      "G.A.T.E. reserves the right to modify these Terms at any time. Updated Terms will be published on the G.A.T.E. platform with a revised effective date. We will make reasonable efforts to notify registered participants of material changes.",
      "Your continued participation in any part of the G.A.T.E. Assessment following the publication of updated Terms constitutes your acceptance of the revised Terms.",
      "For questions regarding these Terms: info@gate-assessment.org",
    ],
  },
];

const SECTIONS_RU = [
  {
    number: "01",
    title: "Принятие Условий",
    content: [
      "Настоящие Условия участия («Условия») являются юридически обязывающим соглашением между вами («Участник») и G.A.T.E. Assessment («G.A.T.E.», «мы», «нас») и регулируют вашу регистрацию и участие в программе G.A.T.E. Assessment.",
      "Завершая регистрацию, вы подтверждаете, что прочитали и поняли настоящие Условия и соглашаетесь соблюдать их в полном объёме, включая Правила программы, Политику конфиденциальности и Политику академической честности, которые являются частью настоящих Условий.",
      "Если вам меньше 18 лет, ваш родитель или законный представитель должен ознакомиться с настоящими Условиями и принять их от вашего имени. Подавая заявку за несовершеннолетнего, родитель или законный представитель подтверждает безоговорочное согласие с Условиями.",
      "Если вы не согласны с настоящими Условиями, не регистрируйтесь и не участвуйте в G.A.T.E. Assessment.",
    ],
  },
  {
    number: "02",
    title: "Регистрация и оплата",
    content: [
      "Регистрация открыта для участников, соответствующих условиям, в течение объявленного периода регистрации на официальной платформе G.A.T.E. G.A.T.E. вправе по своему усмотрению закрыть, продлить или изменить период регистрации.",
      "Размер регистрационного взноса публикуется на платформе G.A.T.E. на момент подачи заявки в указанной валюте и может различаться в зависимости от страны регистрации. Взнос оплачивается полностью при регистрации.",
      "Регистрационные взносы не возвращаются. Возврат не производится ни при каких обстоятельствах, включая, помимо прочего: добровольный отказ от участия; выявленное после регистрации несоответствие условиям участия; дисквалификацию по любой причине; невозможность принять участие в программе из-за болезни, проблем с поездкой или личных обстоятельств; отказ в визе или ограничения на въезд; технический сбой на стороне участника; перенос, изменение или отмену программы со стороны G.A.T.E.; форс-мажорные обстоятельства.",
      "G.A.T.E. вправе без предварительного уведомления изменить размер взносов для будущих циклов.",
    ],
  },
  {
    number: "03",
    title: "Обязанности участника",
    content: [
      "Вы обязуетесь предоставлять точные, полные и достоверные сведения при регистрации и на протяжении всего участия. Сознательное предоставление ложных или вводящих в заблуждение сведений — в том числе о личности, возрасте, месте учёбы или принадлежности к учебному заведению — является существенным нарушением настоящих Условий и основанием для немедленной дисквалификации.",
      "Вы обязуетесь прибыть в принимающий университет в объявленные даты программы, а на протяжении всего пребывания — соблюдать расписание, указания сотрудников G.A.T.E. и правила принимающего учреждения.",
      "Стоимость участия покрывает только то, что указано как включённое на странице программы. Все остальные расходы — в том числе международный перелёт, визовый сбор и страховку — вы несёте самостоятельно. По запросу G.A.T.E. может выдать подтверждающие письма, но не оказывает финансовой помощи с поездкой.",
      "Вы обязуетесь всегда соблюдать правила проведения диагностики, инструкции и Кодекс поведения G.A.T.E.",
    ],
  },
  {
    number: "04",
    title: "Виза, поездка и въезд",
    content: [
      "Зарегистрированные участники самостоятельно получают все документы, необходимые для въезда в страну проведения программы, включая визы, паспорт с достаточным сроком действия и медицинские документы.",
      "По запросу G.A.T.E. выдаёт зарегистрированным участникам официальное письмо-приглашение для подачи на визу. Письмо-приглашение не гарантирует, что государственные органы одобрят визу.",
      "Отказ в визе, ограничения на въезд, болезнь или любые другие обстоятельства, из-за которых зарегистрированный участник не может принять участие в программе, не дают права на возврат регистрационного взноса, альтернативный формат диагностики или какую-либо компенсацию.",
      "G.A.T.E. не возмещает расходы на организацию поездки, которую невозможно осуществить из-за изменения, переноса или отмены программы.",
    ],
  },
  {
    number: "05",
    title: "Интеллектуальная собственность",
    content: [
      "Всё содержание диагностики — вопросы, задачи, структура ответов, критерии оценивания и методики — является исключительной интеллектуальной собственностью G.A.T.E. Assessment. Все права защищены.",
      "Участникам запрещено воспроизводить, фотографировать, записывать, переписывать, пересылать, публиковать или распространять задания в любой форме и на любом носителе — как во время, так и после диагностики. Нарушение является одновременно нарушением академической честности и прав G.A.T.E. на интеллектуальную собственность.",
      "Сертификаты выдаются участникам только для личного использования и подтверждения достижений. G.A.T.E. вправе проверять подлинность любых документов и аннулировать сертификаты в случаях мошенничества, недобросовестного поведения или существенного нарушения настоящих Условий.",
      "Ответы и работы участников переходят в собственность G.A.T.E. и могут храниться, просматриваться и использоваться для оценивания, контроля качества, академических исследований и развития программы без дополнительного вознаграждения участнику.",
    ],
  },
  {
    number: "06",
    title: "Согласие на фото- и видеосъёмку",
    content: [
      "Регистрируясь на программу G.A.T.E. и участвуя в ней, участники (а при необходимости — их родители или законные представители от их имени) дают согласие на фото-, видео- и аудиозапись на мероприятиях G.A.T.E. и на площадке проведения.",
      "G.A.T.E. может использовать эти фотографии, видео- и аудиозаписи в образовательных, рекламных и информационных целях — в том числе на сайте G.A.T.E., в социальных сетях и официальных публикациях — без дополнительного вознаграждения.",
      "Участники, которые не хотят попадать в кадр, должны письменно уведомить G.A.T.E. не позднее чем за четырнадцать (14) дней до мероприятия. G.A.T.E. приложит разумные усилия, чтобы учесть такую просьбу, но не может гарантировать полное отсутствие участника в случайных кадрах.",
    ],
  },
  {
    number: "07",
    title: "Ограничение ответственности",
    content: [
      "В максимальной степени, допускаемой применимым правом, G.A.T.E. Assessment, его должностные лица, сотрудники, партнёры, агенты и аффилированные лица не несут ответственности за: косвенные, случайные, особые, последующие, штрафные убытки и убытки, взыскиваемые в назидание; утрату данных, дохода, возможностей или деловой репутации; вред здоровью или имуществу во время поездки на мероприятия G.A.T.E. или обратно; иные убытки или ущерб, возникшие в связи с вашим участием в G.A.T.E. Assessment.",
      "G.A.T.E. не отвечает за сбои при проведении диагностики, недоступность платформы, ошибки передачи данных или ошибки оценивания, вызванные обстоятельствами вне его разумного контроля.",
      "Совокупная ответственность G.A.T.E. перед отдельным участником по любым требованиям, независимо от их формы, не превышает суммы регистрационного взноса, фактически уплаченного этим участником.",
      "Ничто в настоящих Условиях не ограничивает ответственность за смерть или вред здоровью, причинённые грубой неосторожностью или мошенничеством G.A.T.E., в той мере, в какой такое ограничение запрещено применимым правом.",
    ],
  },
  {
    number: "08",
    title: "Возмещение ущерба",
    content: [
      "Вы обязуетесь возместить ущерб, защищать и ограждать G.A.T.E. Assessment, его должностных лиц, сотрудников, партнёров, агентов и аффилированных лиц от любых претензий, обязательств, ущерба, убытков, затрат и расходов (включая разумные расходы на юристов), возникших в связи с: нарушением вами настоящих Условий; нарушением вами применимого законодательства; нарушением академической честности или мошенническими действиями; недостоверными сведениями, предоставленными вами при регистрации или участии; претензиями третьих лиц, связанными с вашим участием в G.A.T.E. Assessment.",
    ],
  },
  {
    number: "09",
    title: "Форс-мажор",
    content: [
      "G.A.T.E. не считается нарушившим настоящие Условия и не несёт ответственности за неисполнение или задержку исполнения обязательств, если они вызваны обстоятельствами вне его разумного контроля, включая, помимо прочего: стихийные бедствия; эпидемии и пандемии; террористические акты и военные действия; решения государственных органов, санкции и ограничения на поездки; экстремальные погодные явления; иные форс-мажорные обстоятельства.",
      "В таких случаях G.A.T.E. вправе по своему усмотрению изменить, перенести, сменить формат или отменить программу без ответственности перед участниками. Регистрационные взносы не возвращаются, если G.A.T.E. письменно прямо не указал иное.",
    ],
  },
  {
    number: "10",
    title: "Применимое право и разрешение споров",
    content: [
      "Настоящие Условия регулируются и толкуются в соответствии с общими принципами международного коммерческого договорного права, которые могут дополняться законодательством юрисдикции, в которой зарегистрирован G.A.T.E. Assessment.",
      "В случае спора, связанного с настоящими Условиями или вашим участием в G.A.T.E. Assessment, стороны договариваются сначала попытаться урегулировать его путём добросовестных переговоров, обратившись по адресу info@gate-assessment.org.",
      "Если спор не удаётся урегулировать мирным путём в течение тридцати (30) дней, он передаётся на рассмотрение в обязательный арбитраж по регламенту признанного международного арбитражного учреждения, согласованного сторонами. Каждая сторона несёт свои расходы, если арбитр не решит иначе.",
      "Вы прямо отказываетесь от права участвовать в групповых исках, групповом арбитраже или представительских разбирательствах против G.A.T.E. Assessment.",
    ],
  },
  {
    number: "11",
    title: "Делимость положений и полнота соглашения",
    content: [
      "Если какое-либо положение настоящих Условий будет признано судом или арбитром недействительным, незаконным или не имеющим исковой силы, оно ограничивается или исключается в минимально необходимом объёме, а остальные положения сохраняют полную силу.",
      "Настоящие Условия вместе с Правилами программы, Политикой конфиденциальности и Политикой академической честности составляют полное соглашение между вами и G.A.T.E. Assessment в отношении вашего участия в программе и заменяют все предшествующие договорённости, заверения и соглашения.",
    ],
  },
  {
    number: "12",
    title: "Изменение Условий",
    content: [
      "G.A.T.E. вправе в любое время изменять настоящие Условия. Обновлённая редакция публикуется на платформе G.A.T.E. с новой датой вступления в силу. Мы приложим разумные усилия, чтобы уведомить зарегистрированных участников о существенных изменениях.",
      "Продолжение участия в любой части G.A.T.E. Assessment после публикации новой редакции означает ваше согласие с ней.",
      "Вопросы по настоящим Условиям: info@gate-assessment.org",
    ],
  },
];

export default async function TermsPage() {
  if ((await getLocale()) === "ru") {
    return (
      <LegalPage
        title="Условия участия"
        updated="Редакция: ноябрь 2026 · G.A.T.E. Assessment"
        intro="Пожалуйста, внимательно прочитайте настоящие Условия участия до регистрации. В них описаны юридически обязывающие отношения между вами и G.A.T.E. Assessment: ваши обязанности как участника, пределы нашей ответственности, ваши права в отношении взносов и документов, а также порядок разрешения споров. Регистрация означает безоговорочное согласие с настоящими Условиями."
        sections={SECTIONS_RU}
      />
    );
  }
  return (
    <LegalPage
      title="Terms of Participation"
      updated="Updated: November 2026 · G.A.T.E. Assessment"
      intro="Please read these Terms of Participation carefully before registering. They set out the binding legal relationship between you and G.A.T.E. Assessment, including your obligations as a participant, the scope of our liability, your rights with respect to fees and credentials, and the process for resolving disputes. Registration constitutes unconditional acceptance of these Terms."
      sections={SECTIONS}
    />
  );
}
