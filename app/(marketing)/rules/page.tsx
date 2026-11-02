import { LegalPage } from "@/components/site/legal-page";
import { getLocale, pageMetadata } from "@/lib/i18n/server";

export const generateMetadata = () =>
  pageMetadata("/rules", {
    en: {
      title: "Rules & Regulations",
      description:
        "Official rules and regulations governing eligibility, examination conduct, scoring, and participation in the G.A.T.E. Assessment program.",
    },
    ru: {
      title: "Правила программы",
      description: "Официальные правила G.A.T.E. Assessment: условия участия, порядок проведения диагностики, оценивание и награды.",
    },
  });

const SECTIONS = [
  {
    number: "01",
    title: "Eligibility",
    content: [
      "Participation in a G.A.T.E. program is open to any student who, at the time of registration, is enrolled in primary, secondary or pre-university education (equivalent to Grades 1–12). The grades and subjects offered in each program are published on that program's page.",
      "There are no restrictions on nationality, country of residence, language background, or institutional affiliation. Homeschooled students are eligible provided they can supply documentation confirming active secondary-level enrollment.",
      "Each participant must register individually and in exactly one (1) subject area. No participant may register in more than one discipline per assessment cycle. Subject selection is final upon registration confirmation and cannot be altered under any circumstances.",
      "G.A.T.E. reserves the right to verify eligibility at any stage of the program. Participants who are found to be ineligible — at any point before, during, or after the assessment — will be disqualified, and any recognition or certificates issued will be revoked.",
    ],
  },
  {
    number: "02",
    title: "Registration",
    content: [
      "Registration is completed exclusively through the official G.A.T.E. Assessment platform. Applications submitted through any other channel will not be accepted.",
      "A registration fee is required to complete the application. The applicable fee schedule is published on the platform at the time of registration. Fees are non-refundable in all circumstances, including voluntary withdrawal, disqualification, visa denial, technical failure, or program modification or cancellation.",
      "Participants are solely responsible for providing accurate, complete, and truthful information during registration, including identity details, date of birth, institutional enrollment, and subject selection. Submission of false or misleading information constitutes grounds for immediate disqualification.",
      "Participants under the age of 18 must obtain parental or legal guardian consent prior to registration. By completing registration, the participant (or their parent/guardian on their behalf) affirms that all requirements have been met.",
    ],
  },
  {
    number: "03",
    title: "Examination Format",
    content: [
      "Each G.A.T.E. program includes an in-person academic assessment held at the program's host university under supervised examination conditions. There is no qualifying round: registered participants take the assessment directly at the program.",
      "Examination format, duration, and permitted materials are specified in official instructions issued to registered participants before the program. Participants are responsible for reading and complying with all examination instructions.",
      "Unless explicitly authorized in the examination instructions, the following are prohibited during any examination: calculators, mathematical software, reference materials, textbooks, notes, and any form of electronic communication device.",
      "All examination content — including questions, problems, and answers — is strictly confidential. Disclosure, reproduction, or distribution of examination content, in whole or in part, before, during, or after the examination window is prohibited and constitutes academic misconduct.",
    ],
  },
  {
    number: "04",
    title: "Code of Conduct",
    content: [
      "Participants must complete the examination independently, without receiving or providing assistance from any person or resource not explicitly authorized.",
      "Impersonation — that is, taking the examination under another person's identity, or knowingly allowing another person to take the examination on your behalf — is strictly prohibited and will result in immediate and permanent disqualification.",
      "Participants attending a G.A.T.E. program are expected to conduct themselves with integrity, courtesy, and respect toward fellow participants, G.A.T.E. staff, host institution personnel, and the broader academic community. G.A.T.E. reserves the right to remove any participant whose conduct is deemed inappropriate or disruptive.",
      "Participants must not engage in any activity that could reasonably be construed as an attempt to gain an unfair advantage, compromise the integrity of the assessment, or undermine the fairness of the results.",
    ],
  },
  {
    number: "05",
    title: "Scoring and Results",
    content: [
      "Examinations are evaluated by independent subject-matter experts appointed by G.A.T.E. Scoring criteria are determined by G.A.T.E. and applied consistently across all participants. Scores are assessed based on accuracy, methodology, proof quality, and clarity of reasoning.",
      "Results are announced at the program's closing ceremony and published on the official G.A.T.E. platform, where each participant's certificate and performance report can be verified.",
      "Score review requests may be submitted within fourteen (14) calendar days of results publication. Reviews address only clerical and computational errors; they do not involve re-assessment of academic judgment applied by evaluators. Score review outcomes are final.",
    ],
  },
  {
    number: "06",
    title: "Recognition and Certificates",
    content: [
      "Recognition — including Certificate of Distinction, Certificate of High Achievement, Certificate of Merit, and Certificate of Completion — is issued solely at G.A.T.E.'s discretion based on final scores and performance thresholds. G.A.T.E. does not guarantee that any specific recognition level will be awarded in any given cycle.",
      "Recognition decisions are final and not subject to appeal or external review.",
      "Participants receive their certificates at the program's closing ceremony. Certificate authenticity can be verified through the G.A.T.E. credential verification portal.",
      "G.A.T.E. reserves the right to revoke any certificate or recognition if, at any time, it is determined that the participant engaged in academic misconduct, provided false information, or violated these Rules.",
    ],
  },
  {
    number: "07",
    title: "Program Modifications and Force Majeure",
    content: [
      "G.A.T.E. reserves the right, at its sole discretion, to modify, postpone, reschedule, reformat, or cancel any part of the Assessment program at any time, including but not limited to examination dates, venue, format, and eligibility criteria.",
      "In the event of modification or cancellation due to circumstances beyond G.A.T.E.'s reasonable control — including but not limited to natural disasters, public health emergencies, governmental restrictions, war, or force majeure events — G.A.T.E. shall not be liable to participants for any resulting costs or losses. Registration fees will not be refunded in such circumstances unless G.A.T.E. explicitly indicates otherwise in writing.",
      "G.A.T.E. is not responsible for any costs incurred by participants in connection with travel, accommodation, visa applications, or other preparation for a program in the event that the event is modified, relocated, postponed, or cancelled.",
    ],
  },
  {
    number: "08",
    title: "Amendments",
    content: [
      "G.A.T.E. reserves the right to amend these Rules & Regulations at any time. Updated rules will be published on the official platform with a revised effective date.",
      "Continued participation following the publication of any amendment constitutes the participant's acceptance of the revised Rules.",
      "For questions regarding these Rules, contact: info@gate-assessment.org",
    ],
  },
];

const SECTIONS_RU = [
  {
    number: "01",
    title: "Кто может участвовать",
    content: [
      "Участвовать в программе G.A.T.E. может любой школьник, который на момент регистрации обучается в начальной, средней или старшей школе (1–12 классы или эквивалент). Классы и предметы каждой программы указаны на её странице.",
      "Ограничений по гражданству, стране проживания, родному языку или учебному заведению нет. Учащиеся на семейном обучении допускаются при условии, что могут подтвердить документально, что обучаются по программе средней школы.",
      "Каждый участник регистрируется индивидуально и только по одному (1) предмету. Регистрация более чем по одному предмету в рамках одного цикла не допускается. После подтверждения регистрации выбор предмета изменить нельзя ни при каких обстоятельствах.",
      "G.A.T.E. вправе проверить соответствие участника условиям на любом этапе программы. Участник, не соответствующий условиям, — независимо от того, выяснилось это до, во время или после диагностики, — дисквалифицируется, а выданные ему награды и сертификаты аннулируются.",
    ],
  },
  {
    number: "02",
    title: "Регистрация",
    content: [
      "Регистрация проводится только через официальную платформу G.A.T.E. Assessment. Заявки, поданные по другим каналам, не принимаются.",
      "Для завершения регистрации необходимо оплатить регистрационный взнос. Действующие тарифы публикуются на платформе на момент регистрации. Взносы не возвращаются ни при каких обстоятельствах, включая добровольный отказ от участия, дисквалификацию, отказ в визе, технический сбой, изменение или отмену программы.",
      "Участник несёт полную ответственность за точность, полноту и достоверность сведений, указанных при регистрации, включая личные данные, дату рождения, место учёбы и выбранный предмет. Предоставление ложных или вводящих в заблуждение сведений является основанием для немедленной дисквалификации.",
      "Участники младше 18 лет должны получить согласие родителя или законного представителя до регистрации. Завершая регистрацию, участник (или его родитель/законный представитель от его имени) подтверждает, что все требования выполнены.",
    ],
  },
  {
    number: "03",
    title: "Формат диагностики",
    content: [
      "Каждая программа G.A.T.E. включает очную академическую диагностику, которая проходит в принимающем университете в условиях экзамена под наблюдением. Отборочного тура нет: зарегистрированные участники проходят диагностику непосредственно во время программы.",
      "Формат, продолжительность и разрешённые материалы указываются в официальных инструкциях, которые зарегистрированные участники получают до начала программы. Участник обязан ознакомиться со всеми инструкциями и соблюдать их.",
      "Если иное прямо не разрешено инструкциями, во время диагностики запрещены: калькуляторы, математические программы, справочные материалы, учебники, записи и любые электронные средства связи.",
      "Всё содержание диагностики — вопросы, задачи и ответы — строго конфиденциально. Разглашение, воспроизведение или распространение заданий полностью или частично до, во время или после диагностики запрещено и считается нарушением академической честности.",
    ],
  },
  {
    number: "04",
    title: "Правила поведения",
    content: [
      "Участник выполняет задания самостоятельно, не получая и не оказывая помощи и не пользуясь источниками, которые прямо не разрешены.",
      "Выдача себя за другое лицо — то есть прохождение диагностики под чужим именем или сознательное допущение того, что кто-то проходит её за вас, — строго запрещена и влечёт немедленную и бессрочную дисквалификацию.",
      "От участников программы G.A.T.E. ожидается честное, вежливое и уважительное отношение к другим участникам, сотрудникам G.A.T.E., персоналу принимающего университета и всему академическому сообществу. G.A.T.E. вправе отстранить участника, чьё поведение признано недопустимым или мешающим проведению программы.",
      "Участникам запрещены любые действия, которые можно обоснованно расценить как попытку получить несправедливое преимущество, нарушить честность диагностики или поставить под сомнение объективность результатов.",
    ],
  },
  {
    number: "05",
    title: "Оценивание и результаты",
    content: [
      "Работы проверяют независимые эксперты по предметам, назначенные G.A.T.E. Критерии оценивания определяет G.A.T.E., и они единообразно применяются ко всем участникам. Учитываются точность, метод решения, качество доказательства и ясность рассуждений.",
      "Результаты объявляются на церемонии закрытия программы и публикуются на официальной платформе G.A.T.E., где можно проверить сертификат и отчёт каждого участника.",
      "Запрос на перепроверку можно подать в течение четырнадцати (14) календарных дней после публикации результатов. Перепроверка касается только технических и арифметических ошибок и не предполагает пересмотра экспертной оценки проверяющих. Итоги перепроверки окончательны.",
    ],
  },
  {
    number: "06",
    title: "Награды и сертификаты",
    content: [
      "Награды — Certificate of Distinction, Certificate of High Achievement, Certificate of Merit и Certificate of Completion — присуждаются исключительно по усмотрению G.A.T.E. на основании итоговых баллов и пороговых значений. G.A.T.E. не гарантирует, что в том или ином цикле будет присуждён какой-либо определённый уровень награды.",
      "Решения о наградах окончательны и не подлежат обжалованию или внешнему пересмотру.",
      "Участники получают сертификаты на церемонии закрытия программы. Подлинность сертификата можно проверить на портале проверки документов G.A.T.E.",
      "G.A.T.E. вправе аннулировать любой сертификат или награду, если в любой момент будет установлено, что участник нарушил академическую честность, предоставил ложные сведения или нарушил настоящие Правила.",
    ],
  },
  {
    number: "07",
    title: "Изменения программы и форс-мажор",
    content: [
      "G.A.T.E. вправе по собственному усмотрению в любое время изменять, переносить, менять формат или отменять любую часть программы, включая, помимо прочего, даты диагностики, место проведения, формат и условия участия.",
      "Если программа изменена или отменена по причинам, не зависящим от G.A.T.E., — включая, помимо прочего, стихийные бедствия, чрезвычайные ситуации в области здравоохранения, ограничения со стороны государства, военные действия и иные форс-мажорные обстоятельства, — G.A.T.E. не несёт ответственности за понесённые участниками расходы или убытки. В таких случаях регистрационные взносы не возвращаются, если G.A.T.E. письменно прямо не указал иное.",
      "G.A.T.E. не возмещает расходы участников на проезд, проживание, оформление визы или иную подготовку к программе, если мероприятие изменено, перенесено в другое место или на другие даты либо отменено.",
    ],
  },
  {
    number: "08",
    title: "Изменение Правил",
    content: [
      "G.A.T.E. вправе в любое время вносить изменения в настоящие Правила. Обновлённая редакция публикуется на официальной платформе с новой датой вступления в силу.",
      "Продолжение участия после публикации изменений означает согласие участника с новой редакцией Правил.",
      "Вопросы по настоящим Правилам направляйте на info@gate-assessment.org",
    ],
  },
];

export default async function RulesPage() {
  if ((await getLocale()) === "ru") {
    return (
      <LegalPage
        title="Правила программы"
        updated="Редакция: ноябрь 2026 · G.A.T.E. Assessment"
        intro="Настоящие Правила регулируют участие во всех программах G.A.T.E. Регистрируясь, участник соглашается соблюдать их в полном объёме. G.A.T.E. Assessment вправе следить за соблюдением Правил и принимать окончательные решения по всем вопросам допуска, поведения и результатов."
        sections={SECTIONS_RU}
      />
    );
  }
  return (
    <LegalPage
      title="Rules & Regulations"
      updated="Updated: November 2026 · G.A.T.E. Assessment"
      intro="These Rules & Regulations govern participation in every G.A.T.E. program. By registering, each participant agrees to be bound by these Rules in their entirety. G.A.T.E. Assessment reserves the right to enforce these Rules and to make final determinations on all matters of eligibility, conduct, and results."
      sections={SECTIONS}
    />
  );
}
