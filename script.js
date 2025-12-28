/* =========================================================
   Telegram WebApp helpers
========================================================= */
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  // Можно включить расширение окна (по желанию)
  try { tg.expand(); } catch (e) {}
}

/* =========================================================
   TIMER (15 минут) — можно удалить целиком, если не нужен
========================================================= */
(function initTimer() {
  const timeDisplay = document.getElementById("time-display");
  if (!timeDisplay) return;

  let totalSeconds = 15 * 60;

  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    const mm = Math.floor(totalSeconds / 60);
    const ss = totalSeconds % 60;
    timeDisplay.textContent = `${pad(mm)}:${pad(ss)}`;

    if (totalSeconds <= 0) {
      clearInterval(timerId);
      // Можно заблокировать форму при окончании времени:
      const form = document.getElementById("reg-form");
      if (form) {
        [...form.elements].forEach(el => el.disabled = true);
      }
      return;
    }

    totalSeconds -= 1;
  };

  tick();
  const timerId = setInterval(tick, 1000);
})();

/* =========================================================
   DIRECTIONS DATA (IT / NON-IT) + DESCRIPTIONS
========================================================= */

const IT_DIRECTIONS = [
  {
    name: "Системный анализ",
    tracks: [
      {
        value: "it_1_1",
        label: "Аналитик DWH",
        description: `Что предстоит делать:
● Собирать и анализировать требования потребителей данных
● Загружать данные из систем-источников в платформы данных, описывать данные
● Рассчитывать метрики, следить за качеством данных
● Делиться идеями по развитию инструментов платформы данных

Необходимые навыки:
● Уверенное знание SQL (оконные функции, подзапросы)
● Понимание принципов функционирования хранилищ данных

Желательно:
● Базовое знание языка программирования (желательно Python)

Стажировка будет актуальна:
● Как студентам профильных вузов, так и выпускникам онлайн-школ`,
      },
      {
        value: "it_1_2",
        label: "Системный аналитик",
        description: `Что предстоит делать:
● Анализировать требования потребителей данных
● Проектировать модели данных, витрины и хранилища данных
● Наполнять документацию по витринам/моделям данных
● Подготавливать постановки для разработчиков на автоматизацию процессов
● Участвовать в развитии платформы данных

Необходимые навыки:
● Уверенное знание SQL (оконные функции, подзапросы)
● Понимание принципов функционирования хранилищ данных

Желательно:
● Базовое знание языка программирования (желательно Python)

Стажировка будет актуальна:
● Как студентам профильных вузов, так и выпускникам онлайн-школ
● Кандидатам только из Москвы`,
      },
    ],
  },

  {
    name: "Data Scientist",
    tracks: [
      {
        value: "it_2_1",
        label: "Data Scientist (REI-132)",
        description: `Команда: Моделирования розничных рисков

Описание:
Команда строит модели кредитного риска и модели прогнозирования поведения клиента. Отвечаем за построение, внедрение и сопровождение моделей, применяемых на стадии выдачи кредита (скоринг/антифрод), а также на стадиях управления клиентом и взыскания.

Что предстоит делать:
— разрабатывать ML-модели для оценки рисков и прогнозирования поведения;
— анализировать большие массивы данных, искать инсайты;
— участвовать во внедрении моделей в production;
— поддерживать и улучшать существующие модели и пайплайны.

Требования:
— основы ML;
— уверенный Python;
— SQL;
— понимание ML-пайплайнов.

Будет плюсом:
— BigData / Spark;
— хакатоны/соревнования;
— DevOps-навыки.`,
      },
      {
        value: "it_2_2",
        label: "Data Scientist (REI-129)",
        description: `Команда: Управление жизненным циклом клиента

Описание:
Развиваем систему управления жизненным циклом клиента: аналитика, персонализация, коммуникации и автоматизация решений. Цель — повысить качество клиентского опыта и эффективность взаимодействия.

Что предстоит делать:
— строить модели/сегментации для персонализации;
— анализировать отклик и качество коммуникаций;
— проводить эксперименты и оценку эффектов.

Требования:
— Python (pandas/numpy/sklearn);
— SQL (агрегации, оконные);
— статистика и A/B.

Будет плюсом:
— применение AI/LLM в проектах.`,
      },
    ],
  },

  {
    name: "Data Analyst",
    tracks: [
      {
        value: "it_3_1",
        label: "Data Analyst (REI-125)",
        description: `Команда: Разработки антифрод data-сервисов

Описание:
Строим антифрод-решения и data-сервисы для выявления подозрительных операций и защиты клиентов.

Что предстоит делать:
— формировать метрики и требования;
— строить отчеты/витрины/мониторинги;
— анализировать события и аномалии.

Требования:
— SQL уверенно;
— понимание продуктовых метрик приветствуется.`,
      },
      {
        value: "it_3_2",
        label: "Data Analyst (REI-110)",
        description: `Команда: по работе с клиентами среднего и малого бизнеса

Что предстоит делать:
— поддержка отчетности;
— анализ клиентских потоков и поведения;
— подготовка данных из разных источников.

Требования:
— SQL уверенно;
— структурность и коммуникация.`,
      },
      {
        value: "it_3_3",
        label: "Data Analyst (REI-123)",
        description: `Команда: Управление жизненным циклом клиента

Что предстоит делать:
— анализ эффективности коммуникаций;
— сегментации/когорты;
— участие в экспериментах.

Требования:
— SQL;
— основы статистики.`,
      },
    ],
  },
];

const NON_IT_DIRECTIONS = [
  {
    name: "Sales and Customer service",
    tracks: [
      {
        value: "nonit_1_1",
        label: "Products Sales",
        description: ``,
      },
      {
        value: "nonit_1_2",
        label: "Депозитарное обслуживание (выплата доходов, корпоративные события) REI-93",
        description: `Команда: Отдел депозитарного обслуживания

Что предстоит делать:
— обработка событий и запросов клиентов;
— взаимодействие с внешними контрагентами;
— контроль сроков и качества исполнения.

Требования:
— внимательность, аккуратность;
— коммуникабельность;
— базовый интерес к финансовым инструментам приветствуется.`,
      },
      {
        value: "nonit_1_3",
        label: "Развитие цифровых банковских решений (Products sales) REI-105",
        description: `Команда: Продаж и развития продуктов рынка капитала

Что предстоит делать:
— поддержка и развитие клиентских сценариев;
— сбор и анализ обратной связи;
— участие в улучшении процессов и интерфейсов.

Требования:
— системность;
— командная работа и коммуникация.`,
      },
      {
        value: "nonit_1_4",
        label: "Корпоративное обслуживание REI-116",
        description: `Команда: Корпоративного обслуживания

Что предстоит делать:
— сопровождение операций;
— обработка обращений;
— координация с внутренними подразделениями.

Требования:
— внимательность;
— клиентоориентированность.`,
      },
      {
        value: "nonit_1_5",
        label: "Работа с корпоративными клиентами на рынках капитала REI-86",
        description: `Команда: Продаж корпоративным клиентам на рынках капитала

Что предстоит делать:
— подготовка материалов и предложений;
— поддержка сделок и коммуникаций;
— анализ потребностей клиентов.

Требования:
— коммуникабельность;
— интерес к финансовому рынку;
— ответственность.`,
      },
    ],
  },

  {
    name: "Внутренний аудит (Audit)",
    tracks: [
      {
        value: "nonit_2_1",
        label: "Внутренний аудит REI-61",
        description: `Команда: Внутреннего аудита

Что предстоит делать:
— участие в проверках процессов и контролей;
— сбор и анализ информации;
— подготовка рабочих материалов;
— взаимодействие с подразделениями.

Требования:
— аналитический склад ума;
— аккуратность.`,
      },
    ],
  },

  {
    name: "Корпоративное обучение (Methodology)",
    tracks: [
      {
        value: "nonit_3_1",
        label: "Методология обучения REI-124",
        description: `Команда: Корпоративного обучения

Что предстоит делать:
— помощь в разработке курсов и контента;
— сбор обратной связи и улучшение программ;
— поддержка мероприятий и коммуникаций.

Требования:
— грамотность;
— внимательность к деталям.`,
      },
    ],
  },

  {
    name: "Продуктовый менеджмент (Product Management)",
    tracks: [
      {
        value: "nonit_4_1",
        label: "Product Management REI-114",
        description: `Команда: Продуктового менеджмента

Что предстоит делать:
— помощь в исследованиях/аналитике;
— подготовка требований/материалов;
— координация задач с командами;
— участие в запусках улучшений.

Требования:
— системность;
— инициативность.`,
      },
    ],
  },

  {
    name: "Риск-аналитика (Analytics)",
    tracks: [
      {
        value: "nonit_5_1",
        label: "Риск-аналитика REI-84",
        description: `Команда: Риск-аналитики

Что предстоит делать:
— сбор данных и отчетность;
— анализ показателей;
— подготовка материалов для решений.

Требования:
— внимательность;
— Excel/SQL будет плюсом.`,
      },
    ],
  },

  {
    name: "Коммуникации (Communications)",
    tracks: [
      {
        value: "nonit_6_1",
        label: "Communications REI-113",
        description: `Команда: Коммуникаций

Что предстоит делать:
— подготовка текстов и материалов;
— помощь в организации коммуникаций;
— поддержка информационных кампаний.

Требования:
— грамотная речь;
— чувство стиля приветствуется.`,
      },
    ],
  },

  {
    name: "Юристы (Legal)",
    tracks: [
      {
        value: "nonit_7_1",
        label: "Legal REI-122",
        description: `Команда: Юридического сопровождения

Что предстоит делать:
— подготовка/проверка документов;
— помощь в систематизации;
— работа с запросами.

Требования:
— внимательность;
— профильное обучение приветствуется.`,
      },
    ],
  },

  {
    name: "Operations / Back Office",
    tracks: [
      {
        value: "nonit_8_1",
        label: "Операционная поддержка REI-119",
        description: `Команда: Операционного блока

Что предстоит делать:
— обработка операций/документов;
— контроль корректности данных;
— взаимодействие с подразделениями.

Требования:
— усидчивость;
— дисциплина.`,
      },
    ],
  },
];

/* =========================================================
   UI LOGIC: type -> direction -> track -> description
========================================================= */
const form = document.getElementById("reg-form");
const trackTypeSelect = document.getElementById("track_type");
const directionSelect = document.getElementById("direction");
const trackSelect = document.getElementById("track");
const trackDescription = document.getElementById("track_description");

const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const emailErrorEl = document.getElementById("email-error");

const policyLink = document.getElementById("policy-link");
const policyText = document.getElementById("policy-text");

function getDirectionsByType(type) {
  if (type === "it") return IT_DIRECTIONS;
  if (type === "non_it") return NON_IT_DIRECTIONS;
  return [];
}

function resetSelect(select, placeholder) {
  select.innerHTML = "";
  const opt = document.createElement("option");
  opt.value = "";
  opt.textContent = placeholder;
  select.appendChild(opt);
}

function setDisabled(select, disabled) {
  select.disabled = disabled;
  if (disabled) select.value = "";
}

function fillDirections(type) {
  const dirs = getDirectionsByType(type);

  resetSelect(directionSelect, "— Выберите направление —");
  resetSelect(trackSelect, "— Выберите трек —");
  setDisabled(directionSelect, !dirs.length);
  setDisabled(trackSelect, true);

  trackDescription.style.display = "none";
  trackDescription.textContent = "";

  dirs.forEach((d, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = d.name;
    directionSelect.appendChild(opt);
  });
}

function fillTracks(type, directionIdx) {
  const dirs = getDirectionsByType(type);
  const dir = dirs[Number(directionIdx)];

  resetSelect(trackSelect, "— Выберите трек —");
  setDisabled(trackSelect, !dir || !dir.tracks?.length);

  trackDescription.style.display = "none";
  trackDescription.textContent = "";

  if (!dir || !dir.tracks) return;

  dir.tracks.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.value;
    opt.textContent = t.label;
    opt.dataset.description = t.description || "";
    trackSelect.appendChild(opt);
  });
}

trackTypeSelect.addEventListener("change", () => {
  fillDirections(trackTypeSelect.value);
});

directionSelect.addEventListener("change", () => {
  fillTracks(trackTypeSelect.value, directionSelect.value);
});

trackSelect.addEventListener("change", () => {
  const selected = trackSelect.options[trackSelect.selectedIndex];
  const desc = selected?.dataset?.description || "";

  if (desc.trim()) {
    trackDescription.textContent = desc;
    trackDescription.style.display = "block";
  } else {
    trackDescription.style.display = "none";
    trackDescription.textContent = "";
  }
});

/* =========================================================
   Policy toggle
========================================================= */
if (policyLink && policyText) {
  policyLink.addEventListener("click", () => {
    const isShown = policyText.style.display === "block";
    policyText.style.display = isShown ? "none" : "block";
  });
}

/* =========================================================
   Validation + submit (sendData to Telegram)
========================================================= */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function clearMessages() {
  resultEl.textContent = "";
  errorEl.textContent = "";
  emailErrorEl.style.display = "none";
  emailErrorEl.textContent = "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearMessages();

  const data = Object.fromEntries(new FormData(form).entries());

  // Простая валидация
  if (!data.full_name?.trim()) {
    errorEl.textContent = "Укажите ФИО.";
    return;
  }

  if (!data.email?.trim() || !isValidEmail(data.email)) {
    emailErrorEl.textContent = "Введите корректный email.";
    emailErrorEl.style.display = "block";
    return;
  }

  if (!data.phone?.trim()) {
    errorEl.textContent = "Укажите телефон.";
    return;
  }

  if (!data.track_type) {
    errorEl.textContent = "Выберите тип направления (IT / Не IT).";
    return;
  }

  if (!data.direction) {
    errorEl.textContent = "Выберите направление.";
    return;
  }

  if (!data.track) {
    errorEl.textContent = "Выберите трек.";
    return;
  }

  // Приведём direction к читаемому виду (название направления)
  const dirs = getDirectionsByType(data.track_type);
  const dirObj = dirs[Number(data.direction)];
  data.direction_name = dirObj?.name || "";

  // Добавим описание выбранного трека (на случай, если нужно сохранять)
  const trackOpt = trackSelect.options[trackSelect.selectedIndex];
  data.track_description = trackOpt?.dataset?.description || "";

  // Отправка в TG Mini App (если запущено в Telegram)
  const payload = JSON.stringify(data);

  if (tg && typeof tg.sendData === "function") {
    try {
      tg.sendData(payload);
      resultEl.textContent = "Данные отправлены ✅";
      // можно закрыть миниапп:
      // tg.close();
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Не удалось отправить данные в Telegram.";
    }
  } else {
    // Если запущено не внутри Telegram — просто покажем результат
    console.log("Payload:", payload);
    resultEl.textContent = "Готово ✅ (не Telegram среда — данные в консоли)";
  }
});

// Инициализация селектов при загрузке
fillDirections(trackTypeSelect.value || "");
