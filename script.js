// === Miniapp frontend (Telegram WebApp + VK Mini Apps) ===
// ВАЖНО: этот файл — рабочая версия (как у тебя), здесь изменены ТОЛЬКО описания/список вакансий из CSV.
// Никаких других изменений логики/полей/отправки не делалось.

const FUNCTION_URL = "https://functions.yandexcloud.net/d4e1po7m6l0nno0u1c5h";

/* =========================================================
   Platform context: Telegram / VK
========================================================= */
const APP_CONTEXT = {
  platform: "web",
  tg: null,
  vk: null,
};

// Telegram (если открыто как Telegram WebApp)
try {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    APP_CONTEXT.platform = "telegram";
    APP_CONTEXT.tg = {
      initData: tg.initData || "",
      initDataUnsafe: tg.initDataUnsafe || {},
      user: tg.initDataUnsafe?.user || null,
      start_param: tg.initDataUnsafe?.start_param || "",
    };
    tg.ready();
    try { tg.expand(); } catch (_) {}
  }
} catch (_) {}

// VK Mini Apps (если открыто внутри VK)
async function initVK() {
  try {
    const vkBridge = window.vkBridge;
    if (!vkBridge) return;
    await vkBridge.send("VKWebAppInit");
    APP_CONTEXT.platform = "vk";

    const qs = window.location.search ? window.location.search.replace(/^\?/, "") : "";
    APP_CONTEXT.vk = { launchParamsRaw: qs };

    try {
      const info = await vkBridge.send("VKWebAppGetUserInfo");
      APP_CONTEXT.vk.user = info;
    } catch (_) {}
  } catch (_) {}
}
initVK();

/* =========================================================
   Persist form state (localStorage)
========================================================= */
const FORM_STATE_KEY = "ft-bank-reg-form-state:v1";

function readState() {
  try {
    const raw = localStorage.getItem(FORM_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function writeState(state) {
  try {
    localStorage.setItem(FORM_STATE_KEY, JSON.stringify(state));
  } catch (_) {}
}

function clearState() {
  try {
    localStorage.removeItem(FORM_STATE_KEY);
  } catch (_) {}
}

function debounce(fn, wait = 350) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function captureFormState(formEl) {
  const state = {};
  const els = formEl.querySelectorAll("input, select, textarea");
  els.forEach((el) => {
    if (!el.name) return;
    if (el.type === "checkbox") state[el.name] = !!el.checked;
    else if (el.type === "radio") {
      if (el.checked) state[el.name] = el.value;
    } else {
      state[el.name] = el.value;
    }
  });
  return state;
}

function applyFormState(formEl, state) {
  if (!state) return;
  const els = formEl.querySelectorAll("input, select, textarea");

  els.forEach((el) => {
    if (!el.name) return;
    if (!(el.name in state)) return;

    if (el.type === "checkbox") el.checked = !!state[el.name];
    else if (el.type === "radio") el.checked = String(state[el.name]) === String(el.value);
    else el.value = state[el.name];
  });

  // Trigger to restore dependent blocks
  els.forEach((el) => {
    if (!el.name) return;
    if (!(el.name in state)) return;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/* =========================================================
   Tracks data (ТОЛЬКО из CSV, БЕЗ "Количество ставок")
   Источники:
   - "Рабочий файл - Райффайзен Банк 2026 - ИТ.csv"
   - "Рабочий файл - Райффайзен Банк 2026 - Бизнес.csv"
========================================================= */
const IT_TRACK_GROUPS = [{"group":"Системный анализ","items":[{"title":"Системный аналитик","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Обсуждать и собирать требования от бизнеса\n- Анализировать и формализовать требования, описывать бизнес-процессы\n- Подготавливать схемы и спецификации для разработки\n- Участвовать в тестировании и приемке\n\nМы ждем:\n- Готовность погружаться в предметную область и разбираться в деталях\n- Умение структурировать информацию\n- Аналитическое мышление\n\nБудет плюсом:\n- Знание способов выявления требований"}]},{"group":"Анализ данных","items":[{"title":"Дата-сайентист","desc":"Для тех, кто живёт в Москве/МО или готов работать по мск.\n\nЧто предстоит делать:\n- Решать задачи классификации, регрессии и прогнозирования\n- Работать с табличными данными и поиском закономерностей\n- Подбирать и обучать ML-модели\n- Формировать результаты в понятном для бизнеса виде\n\nМы ждем:\n- Уверенное знание Python\n- Понимание основ машинного обучения\n\nБудет плюсом:\n- Опыт использования ИИ, LLM, вайб-кодинг"},{"title":"Аналитик данных","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Анализировать данные\n- Выявлять закономерности и аномалии\n- Готовить рекомендации для бизнеса\n\nМы ждем:\n- SQL\n- Опыт работы с BI-инструментами\n\nБудет плюсом:\n- Понимание принципов работы с данными (ETL, DWH)\n- Умение писать запросы средней сложности\n- Интерес к работе с LLM и ML\n- Знания в области обработки естественного языка (NLP)\n- Знания в области компьютерного зрения"},{"title":"Инженер данных","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Разрабатывать и поддерживать пайплайны данных\n- Работать с источниками и витринами данных\n- Участвовать в построении DWH\n\nМы ждем:\n- Python\n- SQL\n\nБудет плюсом:\n- Опыт работы с Airflow/Spark\n- Понимание ETL-процессов\n- Интерес к работе с LLM и ML"},{"title":"Аналитик качества данных","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Контролировать качество данных\n- Определять правила и метрики качества\n- Работать с витринами и источниками\n\nМы ждем:\n- Внимательность\n- SQL\n\nБудет плюсом:\n- Понимание принципов Data Governance\n- Знание BI-инструментов"},{"title":"Количественный аналитик","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Строить количественные модели\n- Проводить исследования и анализ\n- Готовить материалы для команды\n\nМы ждем:\n- Хорошую математику/статистику\n- Python\n\nБудет плюсом:\n- Понимание моделей на финансовых рынках и их основе (CAPM, Fama-French 3/5 Factor Model)"}]},{"group":"Инфраструктура","items":[{"title":"DevOps-инженер","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Помогать с внедрением CI/CD\n- Участвовать в поддержке инфраструктуры\n- Работать с контейнеризацией и оркестрацией\n\nМы ждем:\n- Понимание принципов DevOps\n- Базовые навыки Linux\n\nБудет плюсом:\n- Опыт программирования или скриптов (например, Python)"},{"title":"Инженер по сопровождению и эксплуатации","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Поддерживать сервисы\n- Участвовать в разборе инцидентов\n- Помогать команде эксплуатации\n\nМы ждем:\n- Внимательность\n- Готовность разбираться\n\nБудет плюсом:\n- Понимание работы микросервисной архитектуры в Kubernetes"}]},{"group":"Тестирование","items":[{"title":"QA-инженер","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Тестировать функциональность\n- Писать тест-кейсы и отчеты\n- Участвовать в улучшении качества продукта\n\nМы ждем:\n- Внимательность\n- Логическое мышление\n\nБудет плюсом:\n- Знание Chrome Devtools и техник тест-дизайна"}]},{"group":"Разработка","items":[{"title":"Python-разработчик","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Помогать в разработке сервисов\n- Писать и улучшать код\n- Работать с базами данных\n\nМы ждем:\n- Python\n- Базовые знания SQL (Select, Join), умение писать простые запросы"},{"title":"Java-разработчик","desc":"Подходит выпускникам онлайн-школ\nФормат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Участвовать в разработке backend\n- Писать код и тесты\n- Участвовать в командной разработке\n\nМы ждем:\n- Java\n- Базовое понимание ООП\n\nБудет плюсом:\n- Git (создание и слияние веток)\n- Знание жизненного цикла IT-продукта"},{"title":"Фронтенд-разработчик","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Разрабатывать интерфейсы\n- Участвовать в улучшении UI\n\nМы ждем:\n- HTML/CSS/JS\n\nБудет плюсом:\n- Опыт работы с фронтенд-фреймворками (React)\n- Понимание принципов работы HTTP"},{"title":"Android-разработчик","desc":"Формат работы: гибридный/удаленный\n\nЧто предстоит делать:\n- Разрабатывать Android-приложение\n- Участвовать в улучшении UX\n\nМы ждем:\n- Базовые навыки\n- Знание Kotlin\n- Наличие pet-проектов на Android"}]}];

const NONIT_TRACK_GROUPS = [{"group":"Клиентские операции и сервис","items":[{"title":"Обслуживание торгового финансирования","desc":"Формат работы: гибрид\n\nЧто предстоит делать:\n- Поддерживать сделки торгового финансирования\n- Работать с документами и запросами\n\nМы ждем:\n- Внимательность\n- Готовность учиться"},{"title":"Депозитарное обслуживание","desc":"Формат работы: гибрид\n\nЧто предстоит делать:\n- Поддерживать процессы депозитарного обслуживания\n- Работать с отчетностью\n\nМы ждем:\n- Аккуратность\n- Ответственность"},{"title":"Развитие цифровых банковских решений","desc":"Формат работы: гибрид\n\nЧто предстоит делать:\n- Участвовать в развитии цифровых решений\n- Помогать в подготовке материалов и аналитики\n\nМы ждем:\n- Системность\n- Внимательность"},{"title":"Работа с корпоративными клиентами","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Поддерживать взаимодействие с корпоративными клиентами\n- Помогать в подготовке документов и материалов\n\nМы ждем:\n- Коммуникабельность\n- Ответственность"},{"title":"Работа с клиентами на рынках капитала","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Поддерживать клиентов на рынках капитала\n- Работать с документацией и расчетами\n\nМы ждем:\n- Внимательность\n- Стрессоустойчивость"}]},{"group":"Внутренний аудит","items":[{"title":"Аудит рынка капитала и ценных бумаг","desc":"Формат работы: гибрид\n\nЧто предстоит делать:\n- Участвовать в аудиторских проверках\n- Готовить материалы и анализ\n\nМы ждем:\n- Аналитическое мышление\n- Внимательность"}]},{"group":"Маркетинг","items":[{"title":"Customer Journey / CRM","desc":"Формат работы: гибрид\n\nЧто предстоит делать:\n- Помогать в CRM-коммуникациях\n- Анализировать CJM и метрики\n\nМы ждем:\n- Интерес к маркетингу\n- Внимательность"},{"title":"Событийный маркетинг","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Помогать в организации мероприятий\n- Поддерживать коммуникации и документы\n\nМы ждем:\n- Организованность\n- Коммуникабельность"}]},{"group":"Бизнес-аналитика","items":[{"title":"Бизнес-аналитик (non-IT)","desc":"Формат работы: гибрид\n\nЧто предстоит делать:\n- Собирать и структурировать информацию\n- Помогать в подготовке аналитики и отчетов\n\nМы ждем:\n- Системность\n- Внимательность"}]},{"group":"Банк для бизнеса","items":[{"title":"Кредитный анализ","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Участвовать в анализе кредитных заявок\n- Помогать в подготовке заключений\n\nМы ждем:\n- Аналитическое мышление\n- Внимательность"},{"title":"Финансовый анализ","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Анализировать финансовую отчетность\n- Готовить материалы для команды\n\nМы ждем:\n- База по финансам/экономике\n- Аккуратность"},{"title":"Сопровождение сделок","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Поддерживать сделки\n- Работать с документами\n\nМы ждем:\n- Ответственность\n- Внимательность"}]},{"group":"Коммуникации","items":[{"title":"Корпоративные коммуникации","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Поддерживать внутренние коммуникации\n- Помогать в подготовке материалов\n\nМы ждем:\n- Грамотность\n- Организованность"}]},{"group":"Финансы и казначейство","items":[{"title":"Казначейство","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Поддерживать казначейские операции\n- Работать с отчетностью\n\nМы ждем:\n- Внимательность\n- Аккуратность"},{"title":"Финансовый контроль","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Помогать в контроле бюджета и отчетности\n\nМы ждем:\n- Аккуратность\n- Ответственность"},{"title":"Финансовое планирование","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Участвовать в планировании\n- Помогать с отчетами\n\nМы ждем:\n- Системность\n- Внимательность"}]},{"group":"Юридический блок","items":[{"title":"Правовое сопровождение","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Поддерживать юридические процессы\n- Готовить документы и материалы\n\nМы ждем:\n- Внимательность\n- Грамотность"}]},{"group":"Риски","items":[{"title":"Риск-аналитика","desc":"Формат работы: офис/гибрид\n\nЧто предстоит делать:\n- Помогать в анализе рисков\n- Готовить материалы\n\nМы ждем:\n- Аналитическое мышление\n- Внимательность"}]}];

/* =========================================================
   Helpers
========================================================= */
function setBlockVisible(el, isVisible) {
  if (!el) return;
  el.style.display = isVisible ? "block" : "none";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function normalizePhone(p) {
  return String(p || "").trim().replace(/[^\d+]/g, "");
}

function resetSelect(select, placeholder = "— Выберите —") {
  if (!select) return;
  select.innerHTML = "";
  const opt = document.createElement("option");
  opt.value = "";
  opt.textContent = placeholder;
  select.appendChild(opt);
}

function fillSelectWithGroups(select, groups) {
  resetSelect(select, "— Выберите —");
  groups.forEach((g) => {
    const og = document.createElement("optgroup");
    og.label = g.group;

    g.items.forEach((it) => {
      const opt = document.createElement("option");
      opt.value = it.title;
      opt.textContent = it.title;
      opt.dataset.desc = it.desc || "";
      og.appendChild(opt);
    });

    select.appendChild(og);
  });
}

function showSelectedDescription(select, descEl) {
  if (!select || !descEl) return;
  const opt = select.selectedOptions?.[0];
  const desc = opt?.dataset?.desc || "";
  if (desc && desc.trim()) {
    descEl.textContent = desc.trim();
    setBlockVisible(descEl, true);
  } else {
    descEl.textContent = "";
    setBlockVisible(descEl, false);
  }
}

/* =========================================================
   Pretty date picker (day/month/year -> hidden YYYY-MM-DD)
========================================================= */
function initBirthDatePicker() {
  const day = document.getElementById("birth_day");
  const month = document.getElementById("birth_month");
  const year = document.getElementById("birth_year");
  const hidden = document.getElementById("birth_date");

  if (!day || !month || !year || !hidden) return;

  // Fill day 1..31
  if (day.options.length <= 1) {
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement("option");
      opt.value = String(d).padStart(2, "0");
      opt.textContent = String(d);
      day.appendChild(opt);
    }
  }

  // Fill months
  const months = [
    ["01","Январь"],["02","Февраль"],["03","Март"],["04","Апрель"],
    ["05","Май"],["06","Июнь"],["07","Июль"],["08","Август"],
    ["09","Сентябрь"],["10","Октябрь"],["11","Ноябрь"],["12","Декабрь"],
  ];
  if (month.options.length <= 1) {
    months.forEach(([v,t]) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = t;
      month.appendChild(opt);
    });
  }

  // Fill years
  if (year.options.length <= 1) {
    const nowY = new Date().getFullYear();
    const maxY = nowY - 14;
    const minY = nowY - 80;
    for (let y = maxY; y >= minY; y--) {
      const opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      year.appendChild(opt);
    }
  }

  function daysInMonth(yyyy, mm) {
    return new Date(Number(yyyy), Number(mm), 0).getDate();
  }

  function clampDays() {
    if (!year.value || !month.value) return;
    const maxD = daysInMonth(year.value, month.value);
    const cur = Number(day.value || "0");
    for (let i = 1; i < day.options.length; i++) {
      const d = Number(day.options[i].value);
      day.options[i].disabled = d > maxD;
    }
    if (cur > maxD) day.value = String(maxD).padStart(2, "0");
  }

  function syncHidden() {
    if (!year.value || !month.value || !day.value) {
      hidden.value = "";
      return;
    }
    hidden.value = `${year.value}-${month.value}-${day.value}`;
  }

  year.addEventListener("change", () => { clampDays(); syncHidden(); });
  month.addEventListener("change", () => { clampDays(); syncHidden(); });
  day.addEventListener("change", () => { syncHidden(); });

  // if hidden already has value (restored)
  if (hidden.value && /^\d{4}-\d{2}-\d{2}$/.test(hidden.value)) {
    const [yy, mm, dd] = hidden.value.split("-");
    year.value = yy;
    month.value = mm;
    clampDays();
    day.value = dd;
    syncHidden();
  }
}

/* =========================================================
   Main
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reg-form");
  const resultEl = document.getElementById("result");
  const errorEl = document.getElementById("error");
  const emailErrorEl = document.getElementById("email-error");

  const city = document.getElementById("city");
  const cityOtherBlock = document.getElementById("city_other_block");
  const cityOther = document.getElementById("city_other");
  const tzBlock = document.getElementById("timezone_diff_block");
  const tz = document.getElementById("timezone_diff");

  const degree = document.getElementById("education_degree");
  const gradYearBlock = document.getElementById("grad_year_block");
  const gradYear = document.getElementById("graduation_year");

  const specialty = document.getElementById("specialty");
  const specialtyOtherBlock = document.getElementById("specialty_other_block");
  const specialtyOther = document.getElementById("specialty_other");

  const direction = document.getElementById("internship_direction");

  const onlineCoursesBlock = document.getElementById("online_courses_block");
  const onlineCourses = document.getElementById("online_courses");
  const onlineCourseYearBlock = document.getElementById("online_course_year_block");
  const onlineCourseYear = document.getElementById("online_course_year");
  const onlineCourseYearOtherBlock = document.getElementById("online_course_year_other_block");
  const onlineCourseYearOther = document.getElementById("online_course_year_other");

  const prioritiesBlock = document.getElementById("priorities_block");
  const priority1 = document.getElementById("priority1");
  const priority2 = document.getElementById("priority2");
  const p1Desc = document.getElementById("priority1_description");
  const p2Desc = document.getElementById("priority2_description");

  const policyLink = document.getElementById("policy-link");
  const policyText = document.getElementById("policy-text");

  if (!form) return;

  function clearMessages() {
    if (resultEl) resultEl.textContent = "";
    if (errorEl) errorEl.textContent = "";
    if (emailErrorEl) {
      emailErrorEl.style.display = "none";
      emailErrorEl.textContent = "";
    }
  }

  // Init date picker
  initBirthDatePicker();

  // Restore persisted state
  applyFormState(form, readState());
  const persist = debounce(() => writeState(captureFormState(form)), 350);
  form.addEventListener("input", persist);
  form.addEventListener("change", persist);

  // Policy toggle
  if (policyLink && policyText) {
    policyLink.addEventListener("click", () => {
      const isOpen = policyText.style.display === "block";
      policyText.style.display = isOpen ? "none" : "block";
    });
  }

  // City logic
  function updateCityBlocks() {
    const v = city?.value || "";
    const isOther = v === "Другой";
    setBlockVisible(cityOtherBlock, isOther);
    setBlockVisible(tzBlock, isOther);

    if (!isOther) {
      if (cityOther) cityOther.value = "";
      if (tz) tz.value = "";
    }
  }
  if (city) {
    city.addEventListener("change", updateCityBlocks);
    updateCityBlocks();
  }

  // Degree logic
  function updateDegreeBlocks() {
    const noHigher = (degree?.value || "") === "Нет высшего образования";
    setBlockVisible(gradYearBlock, !noHigher);
    if (noHigher && gradYear) gradYear.value = "";
  }
  if (degree) {
    degree.addEventListener("change", updateDegreeBlocks);
    updateDegreeBlocks();
  }

  // Specialty other
  function updateSpecialtyBlocks() {
    const isOther = (specialty?.value || "") === "Другое";
    setBlockVisible(specialtyOtherBlock, isOther);
    if (!isOther && specialtyOther) specialtyOther.value = "";
  }
  if (specialty) {
    specialty.addEventListener("change", updateSpecialtyBlocks);
    updateSpecialtyBlocks();
  }

  // Online courses logic
  function updateOnlineCourseYear() {
    const provider = onlineCourses?.value || "";
    const showYear = provider && provider !== "Не проходил(а)";
    setBlockVisible(onlineCourseYearBlock, showYear);

    if (!showYear) {
      if (onlineCourseYear) onlineCourseYear.value = "";
      if (onlineCourseYearOther) onlineCourseYearOther.value = "";
      setBlockVisible(onlineCourseYearOtherBlock, false);
      return;
    }

    const isOtherYear = (onlineCourseYear?.value || "") === "Другой";
    setBlockVisible(onlineCourseYearOtherBlock, isOtherYear);
    if (!isOtherYear && onlineCourseYearOther) onlineCourseYearOther.value = "";
  }

  if (onlineCourses) onlineCourses.addEventListener("change", updateOnlineCourseYear);
  if (onlineCourseYear) onlineCourseYear.addEventListener("change", updateOnlineCourseYear);

  // Priorities fill
  function fillPriorities(kind) {
    const groups = kind === "IT" ? IT_TRACK_GROUPS : NONIT_TRACK_GROUPS;
    fillSelectWithGroups(priority1, groups);
    fillSelectWithGroups(priority2, groups);
    setBlockVisible(p1Desc, false);
    setBlockVisible(p2Desc, false);
  }

  if (priority1) priority1.addEventListener("change", () => showSelectedDescription(priority1, p1Desc));
  if (priority2) priority2.addEventListener("change", () => showSelectedDescription(priority2, p2Desc));

  // Direction change
  function updateDirectionBlocks() {
    const v = direction?.value || "";
    const isIT = v === "IT" || v === "ИТ";
    const isNonIT = v === "Бизнес" || v === "Non-IT" || v === "не IT";

    setBlockVisible(onlineCoursesBlock, isIT);
    if (!isIT) {
      if (onlineCourses) onlineCourses.value = "";
      if (onlineCourseYear) onlineCourseYear.value = "";
      if (onlineCourseYearOther) onlineCourseYearOther.value = "";
      setBlockVisible(onlineCourseYearBlock, false);
      setBlockVisible(onlineCourseYearOtherBlock, false);
    }

    const showPriorities = isIT || isNonIT;
    setBlockVisible(prioritiesBlock, showPriorities);

    if (showPriorities) {
      fillPriorities(isIT ? "IT" : "Non-IT");
    } else {
      resetSelect(priority1);
      resetSelect(priority2);
      setBlockVisible(p1Desc, false);
      setBlockVisible(p2Desc, false);
    }
  }

  if (direction) {
    direction.addEventListener("change", updateDirectionBlocks);
    updateDirectionBlocks();
  }

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const data = {};
    const fd = new FormData(form);
    for (const [k, v] of fd.entries()) {
      data[k] = String(v || "").trim();
    }

    // city normalization
    if (data.city !== "Другой") {
      data.city_other = "";
      data.timezone_diff = "";
    }

    // education
    if (data.education_degree === "Нет высшего образования") {
      data.graduation_year = "";
    }

    // specialty
    if (data.specialty !== "Другое") {
      data.specialty_other = "";
    }

    // direction normalization for backend: IT / Non-IT
    if (data.internship_direction === "ИТ") data.internship_direction = "IT";
    if (data.internship_direction === "Бизнес") data.internship_direction = "Non-IT";

    // online courses
    if (data.internship_direction !== "IT") {
      data.online_courses = "";
      data.online_course_year = "";
      data.online_course_year_other = "";
    } else {
      if (!data.online_courses || data.online_courses === "Не проходил(а)") {
        data.online_course_year = "";
        data.online_course_year_other = "";
      } else {
        if (data.online_course_year !== "Другой") {
          data.online_course_year_other = "";
        }
      }
    }

    // validate
    if (!data.last_name || !data.first_name) {
      errorEl.textContent = "Пожалуйста, заполните имя и фамилию.";
      return;
    }
    if (!data.email || !isValidEmail(data.email)) {
      emailErrorEl.style.display = "block";
      emailErrorEl.textContent = "Пожалуйста, укажите корректный e-mail.";
      return;
    }
    if (!data.phone) {
      errorEl.textContent = "Пожалуйста, укажите номер телефона.";
      return;
    }
    if (!data.birth_date) {
      errorEl.textContent = "Пожалуйста, выберите дату рождения.";
      return;
    }
    if (!data.city) {
      errorEl.textContent = "Пожалуйста, выберите город проживания.";
      return;
    }
    if (data.city === "Другой" && !data.timezone_diff) {
      errorEl.textContent = "Пожалуйста, выберите разницу во времени относительно Мск.";
      return;
    }
    if (!data.education_degree) {
      errorEl.textContent = "Пожалуйста, выберите степень образования.";
      return;
    }
    if (data.education_degree !== "Нет высшего образования" && !data.graduation_year) {
      errorEl.textContent = "Пожалуйста, выберите год выпуска.";
      return;
    }
    if (!data.specialty) {
      errorEl.textContent = "Пожалуйста, выберите специальность.";
      return;
    }
    if (data.specialty === "Другое" && !data.specialty_other) {
      errorEl.textContent = "Пожалуйста, укажите специальность.";
      return;
    }
    if (!data.internship_direction) {
      errorEl.textContent = "Пожалуйста, выберите направление стажировки.";
      return;
    }
    if (!data.priority1 || !data.priority2) {
      errorEl.textContent = "Пожалуйста, выберите два приоритета.";
      return;
    }
    if (!data.hours_per_week) {
      errorEl.textContent = "Пожалуйста, выберите количество часов.";
      return;
    }
    if (!data.ready_6_months) {
      errorEl.textContent = "Пожалуйста, выберите готовность на 6 месяцев.";
      return;
    }

    // platform meta
    data.platform = APP_CONTEXT.platform;
    if (APP_CONTEXT.platform === "telegram" && APP_CONTEXT.tg) {
      data.tg_init_data = APP_CONTEXT.tg.initData || "";
    }
    if (APP_CONTEXT.platform === "vk") {
      data.vk_launch_params = APP_CONTEXT.vk?.launchParamsRaw || "";
    }

    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const js = await res.json().catch(() => null);

      if (!res.ok) {
        errorEl.textContent = js?.error || `Ошибка отправки (HTTP ${res.status})`;
        return;
      }

      if (js && js.duplicate) {
        resultEl.textContent = js.message || "Мы уже нашли вашу заявку ✅";
        clearState();
        return;
      }

      resultEl.textContent = "Данные отправлены ✅";
      clearState();
    } catch (err) {
      errorEl.textContent = "Ошибка отправки: " + (err?.message || String(err));
    }
  });
});
