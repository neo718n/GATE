import { LegalPage } from "@/components/site/legal-page";
import { getLocale, pageMetadata } from "@/lib/i18n/server";

export const generateMetadata = () =>
  pageMetadata("/privacy", {
    en: {
      title: "Privacy Policy",
      description: "G.A.T.E. Assessment privacy policy — how we collect, use, store, and protect your personal data.",
    },
    ru: {
      title: "Политика конфиденциальности",
      description: "Политика конфиденциальности G.A.T.E. Assessment: как мы собираем, используем, храним и защищаем ваши персональные данные.",
    },
  });

const SECTIONS = [
  {
    number: "01",
    title: "Data Controller",
    content: [
      "G.A.T.E. Assessment (\"G.A.T.E.\", \"we\", \"us\", \"our\") is the data controller responsible for the personal information collected through the G.A.T.E. platform and assessment program.",
      "For all privacy-related inquiries, including data access requests and complaints, contact: info@gate-assessment.org",
    ],
  },
  {
    number: "02",
    title: "Information We Collect",
    content: [
      "Identity and contact data: full name, date of birth, nationality, email address, and phone number (where provided).",
      "Academic data: name of school or educational institution, year of study, country of enrollment, and selected subject area.",
      "Assessment data: examination responses, scores, evaluation records, and certificate information.",
      "Technical data: IP address, browser type, device identifiers, and platform usage data collected automatically during your use of the G.A.T.E. platform.",
      "We do not collect payment card numbers or bank account details directly. All payments are processed through a certified third-party payment provider subject to its own privacy policy.",
    ],
  },
  {
    number: "03",
    title: "How We Use Your Information",
    content: [
      "To process your registration, verify eligibility, and administer your participation in the G.A.T.E. Assessment.",
      "To conduct and evaluate examinations, publish results, and issue certificates and awards.",
      "To communicate with you regarding examination instructions, results, schedule changes, and program updates.",
      "To operate and improve the G.A.T.E. platform, detect fraud, and ensure platform security.",
      "To meet legal obligations, including record-keeping requirements applicable to our operations.",
      "To contact you about future G.A.T.E. assessment cycles or program updates — only where you have provided consent, which may be withdrawn at any time.",
    ],
  },
  {
    number: "04",
    title: "Legal Basis for Processing",
    content: [
      "Performance of contract: processing is necessary to fulfill your registration agreement and deliver the services you have enrolled in.",
      "Legitimate interests: fraud prevention, platform security, academic integrity enforcement, and program improvement — balanced against your rights and freedoms.",
      "Consent: marketing communications and non-essential data processing. You may withdraw consent at any time by contacting info@gate-assessment.org.",
      "Legal obligation: where processing is required by applicable law.",
    ],
  },
  {
    number: "05",
    title: "Data Retention",
    content: [
      "Participant registration and examination data is retained for a maximum of five (5) years from the date of participation, after which it is securely deleted or anonymized, unless a longer retention period is required by law.",
      "Certificate and credential verification records — including participant name, award level, and subject — may be retained indefinitely to support the integrity of the G.A.T.E. credential verification system.",
      "You may request early deletion of your personal data, subject to the limitations described in Section 07.",
    ],
  },
  {
    number: "06",
    title: "International Data Transfers",
    content: [
      "G.A.T.E. operates an international program with participants from across the world. Your personal data may be processed in countries other than your country of residence. In particular, data related to an onsite program may be shared with the host institution and authorized event partners located in the host country for the purpose of organizing and administering the program.",
      "When transferring personal data internationally, G.A.T.E. implements appropriate safeguards consistent with applicable data protection laws, including contractual protections with our data processors.",
    ],
  },
  {
    number: "07",
    title: "Sharing Your Information",
    content: [
      "G.A.T.E. does not sell, rent, or trade your personal data to third parties.",
      "We may share your data with: authorized service providers (cloud hosting, email delivery, payment processing) under binding data processing agreements; the host institution and authorized event partners solely for the purpose of administering the onsite program; legal authorities where required by applicable law or in response to lawful requests.",
      "G.A.T.E. may publish anonymized, aggregated statistics about participation (such as country-level participation counts) without identifying individual participants.",
    ],
  },
  {
    number: "08",
    title: "Your Rights",
    content: [
      "Depending on the data protection laws applicable to your jurisdiction, you may have the right to: access the personal data we hold about you; request correction of inaccurate or incomplete data; request deletion of your personal data (subject to legal retention requirements and our legitimate interests in maintaining academic records); object to or request restriction of certain processing activities; receive your data in a portable format; and withdraw consent at any time where processing is based on consent.",
      "To exercise any of these rights, submit a written request to: info@gate-assessment.org. We will respond within thirty (30) days. We may require you to verify your identity before processing the request.",
      "Residents of the European Economic Area, the United Kingdom, and other jurisdictions with comprehensive data protection laws retain rights under those applicable frameworks. G.A.T.E. is committed to honoring those rights to the extent required by law.",
    ],
  },
  {
    number: "09",
    title: "Children's Privacy",
    content: [
      "G.A.T.E. programs are designed for school students in Grades 1–12. Participants under the age of 18 are considered minors, and their registration requires the verified consent of a parent or legal guardian.",
      "By completing registration for a minor, the parent or guardian confirms that they have read this Privacy Policy, that they consent on behalf of the minor to the collection and processing of the minor's personal data as described herein, and that all information submitted is accurate.",
      "G.A.T.E. does not knowingly collect personal data from a minor without the consent of a parent or legal guardian. If we become aware that a minor's data has been collected without appropriate consent, we will delete that data promptly.",
    ],
  },
  {
    number: "10",
    title: "Security",
    content: [
      "G.A.T.E. implements technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, or destruction. These measures include access controls, encryption of data in transit, and periodic security reviews.",
      "No transmission of data over the internet is completely secure. While we take all reasonable precautions, G.A.T.E. cannot guarantee absolute security and is not liable for unauthorized access resulting from circumstances beyond our reasonable control.",
    ],
  },
  {
    number: "11",
    title: "Cookies",
    content: [
      "The G.A.T.E. platform uses essential cookies for authentication and secure session management. These cookies are necessary for the platform to function and cannot be disabled.",
      "We may also use analytical cookies to understand how participants use the platform, in order to improve the experience. You may disable non-essential cookies through your browser settings at any time, though this may affect platform functionality.",
    ],
  },
  {
    number: "12",
    title: "Changes to This Policy",
    content: [
      "G.A.T.E. may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. The revised policy will be published on the platform with an updated effective date.",
      "Where changes are material, we will notify registered participants by email. Continued use of the G.A.T.E. platform after the effective date of any revision constitutes acceptance of the updated policy.",
      "For questions about this Privacy Policy: info@gate-assessment.org",
    ],
  },
];

const SECTIONS_RU = [
  {
    number: "01",
    title: "Оператор данных",
    content: [
      "G.A.T.E. Assessment («G.A.T.E.», «мы», «нас», «наш») является оператором персональных данных, собираемых через платформу и программу G.A.T.E.",
      "По всем вопросам конфиденциальности, включая запросы на доступ к данным и жалобы, пишите на info@gate-assessment.org",
    ],
  },
  {
    number: "02",
    title: "Какие данные мы собираем",
    content: [
      "Личные и контактные данные: имя и фамилия, дата рождения, гражданство, адрес электронной почты и номер телефона (если указан).",
      "Учебные данные: название школы или учебного заведения, класс, страна обучения и выбранный предмет.",
      "Данные диагностики: ответы, баллы, результаты проверки и сведения о сертификатах.",
      "Технические данные: IP-адрес, тип браузера, идентификаторы устройства и данные об использовании платформы, которые собираются автоматически во время работы с платформой G.A.T.E.",
      "Мы не собираем номера банковских карт и реквизиты счетов напрямую. Все платежи обрабатывает сертифицированный платёжный провайдер, на которого распространяется его собственная политика конфиденциальности.",
    ],
  },
  {
    number: "03",
    title: "Как мы используем данные",
    content: [
      "Чтобы обработать вашу регистрацию, проверить соответствие условиям участия и организовать ваше участие в G.A.T.E. Assessment.",
      "Чтобы провести и оценить диагностику, опубликовать результаты, выдать сертификаты и награды.",
      "Чтобы сообщать вам об инструкциях, результатах, изменениях в расписании и новостях программы.",
      "Чтобы поддерживать и улучшать платформу G.A.T.E., выявлять мошенничество и обеспечивать безопасность.",
      "Чтобы выполнять требования закона, в том числе по хранению документации.",
      "Чтобы рассказывать вам о будущих программах G.A.T.E. и новостях — только с вашего согласия, которое можно отозвать в любой момент.",
    ],
  },
  {
    number: "04",
    title: "Правовые основания обработки",
    content: [
      "Исполнение договора: обработка необходима для выполнения условий регистрации и оказания услуг, на которые вы записались.",
      "Законные интересы: предотвращение мошенничества, безопасность платформы, соблюдение академической честности и развитие программы — с учётом ваших прав и свобод.",
      "Согласие: рекламные рассылки и необязательная обработка данных. Согласие можно отозвать в любой момент, написав на info@gate-assessment.org.",
      "Требование закона: когда обработка предусмотрена применимым законодательством.",
    ],
  },
  {
    number: "05",
    title: "Срок хранения",
    content: [
      "Регистрационные данные и данные диагностики хранятся не более пяти (5) лет с даты участия, после чего надёжно удаляются или обезличиваются, если закон не требует более длительного хранения.",
      "Записи для проверки сертификатов и документов — имя участника, уровень награды и предмет — могут храниться бессрочно, чтобы система проверки документов G.A.T.E. оставалась надёжной.",
      "Вы можете запросить досрочное удаление персональных данных с учётом ограничений, описанных в разделе 07.",
    ],
  },
  {
    number: "06",
    title: "Международная передача данных",
    content: [
      "G.A.T.E. — международная программа с участниками со всего мира, поэтому ваши данные могут обрабатываться за пределами страны вашего проживания. В частности, данные, связанные с очной программой, могут передаваться принимающему университету и уполномоченным партнёрам в стране проведения для её организации.",
      "При международной передаче данных G.A.T.E. применяет надлежащие меры защиты в соответствии с законодательством о защите данных, включая договорные гарантии с обработчиками данных.",
    ],
  },
  {
    number: "07",
    title: "Кому мы передаём данные",
    content: [
      "G.A.T.E. не продаёт, не сдаёт в аренду и не обменивает ваши персональные данные третьим лицам.",
      "Мы можем передавать данные: уполномоченным поставщикам услуг (облачный хостинг, отправка писем, обработка платежей) на основании договоров об обработке данных; принимающему университету и уполномоченным партнёрам — исключительно для проведения очной программы; государственным органам — когда этого требует закон или законный запрос.",
      "G.A.T.E. может публиковать обезличенную сводную статистику об участии (например, число участников по странам), не позволяющую установить личность.",
    ],
  },
  {
    number: "08",
    title: "Ваши права",
    content: [
      "В зависимости от законодательства о защите данных вашей страны вы можете иметь право: получить доступ к вашим данным, которые у нас хранятся; потребовать исправить неточные или неполные данные; потребовать удалить персональные данные (с учётом требований закона о хранении и нашего законного интереса в сохранении академических записей); возразить против определённой обработки или потребовать её ограничить; получить данные в переносимом формате; отозвать согласие в любой момент, если обработка основана на согласии.",
      "Чтобы воспользоваться этими правами, направьте письменный запрос на info@gate-assessment.org. Мы ответим в течение тридцати (30) дней. Перед выполнением запроса мы можем попросить подтвердить вашу личность.",
      "Жители Европейской экономической зоны, Великобритании и других юрисдикций с развитым законодательством о защите данных сохраняют права, которые им предоставляет это законодательство. G.A.T.E. соблюдает эти права в объёме, требуемом законом.",
    ],
  },
  {
    number: "09",
    title: "Данные детей",
    content: [
      "Программы G.A.T.E. рассчитаны на школьников 1–12 классов. Участники младше 18 лет считаются несовершеннолетними, и для их регистрации требуется подтверждённое согласие родителя или законного представителя.",
      "Регистрируя несовершеннолетнего, родитель или законный представитель подтверждает, что ознакомился с настоящей Политикой конфиденциальности, даёт от имени несовершеннолетнего согласие на сбор и обработку его персональных данных, как описано в ней, и что все указанные сведения достоверны.",
      "G.A.T.E. сознательно не собирает персональные данные несовершеннолетних без согласия родителя или законного представителя. Если нам станет известно, что такие данные были собраны без надлежащего согласия, мы незамедлительно их удалим.",
    ],
  },
  {
    number: "10",
    title: "Безопасность",
    content: [
      "G.A.T.E. применяет технические и организационные меры для защиты ваших данных от несанкционированного доступа, раскрытия, изменения или уничтожения: разграничение доступа, шифрование данных при передаче и регулярные проверки безопасности.",
      "Передача данных через интернет не может быть абсолютно безопасной. Мы принимаем все разумные меры предосторожности, но не можем гарантировать абсолютную защиту и не несём ответственности за несанкционированный доступ, вызванный обстоятельствами вне нашего разумного контроля.",
    ],
  },
  {
    number: "11",
    title: "Файлы cookie",
    content: [
      "Платформа G.A.T.E. использует необходимые cookie для входа в аккаунт, безопасной работы сессии и запоминания выбранного языка. Без них платформа не работает, поэтому отключить их нельзя.",
      "Мы также можем использовать аналитические cookie, чтобы понимать, как участники пользуются платформой, и делать её удобнее. Необязательные cookie можно в любой момент отключить в настройках браузера, но это может повлиять на работу платформы.",
    ],
  },
  {
    number: "12",
    title: "Изменения Политики",
    content: [
      "G.A.T.E. может время от времени обновлять настоящую Политику конфиденциальности с учётом изменений в нашей работе или законодательстве. Новая редакция публикуется на платформе с обновлённой датой вступления в силу.",
      "О существенных изменениях мы уведомим зарегистрированных участников по электронной почте. Продолжение использования платформы G.A.T.E. после вступления новой редакции в силу означает согласие с ней.",
      "Вопросы по настоящей Политике конфиденциальности: info@gate-assessment.org",
    ],
  },
];

export default async function PrivacyPage() {
  if ((await getLocale()) === "ru") {
    return (
      <LegalPage
        title="Политика конфиденциальности"
        updated="Редакция: ноябрь 2026 · G.A.T.E. Assessment"
        intro="Настоящая Политика конфиденциальности объясняет, как G.A.T.E. Assessment собирает, использует, хранит и защищает персональные данные участников, координаторов и посетителей сайта в рамках программы G.A.T.E. Assessment. Пожалуйста, внимательно ознакомьтесь с ней до регистрации. Пользуясь платформой G.A.T.E. или участвуя в любой части программы, вы подтверждаете, что прочитали и поняли настоящую Политику."
        sections={SECTIONS_RU}
      />
    );
  }
  return (
    <LegalPage
      title="Privacy Policy"
      updated="Updated: November 2026 · G.A.T.E. Assessment"
      intro="This Privacy Policy explains how G.A.T.E. Assessment collects, uses, stores, and protects personal information provided by participants, coordinators, and visitors in connection with the G.A.T.E. Assessment program. Please read this policy carefully before registering. By using the G.A.T.E. platform or participating in any part of the program, you acknowledge that you have read and understood this policy."
      sections={SECTIONS}
    />
  );
}
