// === BACKEND ENDPOINT (Yandex Cloud Function) ===
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
   Tracks data (from CSV)
========================================================= */
const IT_TRACK_GROUPS = [{"group":"Системный анализ","items":[{"title":"Аналитик DWH","desc":"Что предстоит делать:\n●        Собирать и анализировать требования к витринам данных.\n●        Описывать спецификации и участвовать в внедрении.\n\nКого ищем:\n●        Базовое понимание SQL.\n●        Умение работать с требованиями.\n●        Внимательность к деталям.\n\nБудет плюсом:\n●        Опыт с DWH/ETL.\n●        Понимание банковских данных."},{"title":"Системный аналитик","desc":"Что предстоит делать:\n●        Анализировать бизнес-требования.\n●        Описывать процессы и интеграции.\n●        Взаимодействовать с разработкой и тестированием.\n\nКого ищем:\n●        Коммуникабельность.\n●        Структурное мышление.\n●        Желание развиваться в аналитике.\n\nБудет плюсом:\n●        Опыт в финтехе.\n●        Понимание API/интеграций."}]},{"group":"Data","items":[{"title":"Data Scientist (REI-132)","desc":"Команда: \nМоделирования розничных рисков\n\nОписание:\n● Участие в разработке и внедрении моделей риск-менеджмента.\n● Анализ данных, построение признаков.\n● Валидация и мониторинг моделей.\n\nТребования:\n● Python, базовая статистика.\n● Понимание ML.\n\nПлюсом будет:\n● Опыт с кредитными рисками."},{"title":"Data Scientist (REI-129)","desc":"Команда: \nУправление жизненныи циклом клиента\n\nОписание:\n● Прогнозирование, сегментация.\n● Работа с большими данными.\n\nТребования:\n● Python, SQL.\n● Основы ML.\n\nПлюсом будет:\n● Опыт с продуктовой аналитикой."},{"title":"Data Analyst (REI-125)","desc":"Команда: \nРазработки антифрод data-сервисов\n\nОписание:\n● Анализ метрик и аномалий.\n● Подготовка отчетов.\n\nТребования:\n● SQL.\n● Аналитическое мышление.\n\nПлюсом будет:\n● Опыт в антифроде/рисках."}]},{"group":"Разработка","items":[{"title":"Java Developer (REI-101)","desc":"Описание:\n● Разработка backend на Java.\n● Работа с микросервисами.\n\nТребования:\n● Java Core.\n● Git.\n\nПлюсом будет:\n● Spring, SQL."},{"title":"Frontend Developer (REI-102)","desc":"Описание:\n● Разработка интерфейсов.\n\nТребования:\n● JS/TS.\n● HTML/CSS.\n\nПлюсом будет:\n● React/Vue."}]}];
const NONIT_TRACK_GROUPS = [{"group":"HR","items":[{"title":"HR Generalist","desc":"Описание:\n● Поддержка HR-процессов.\n● Работа с сотрудниками.\n\nТребования:\n● Коммуникация.\n● Организованность."}]},{"group":"Маркетинг","items":[{"title":"Marketing Analyst","desc":"Описание:\n● Анализ кампаний.\n● Отчётность.\n\nТребования:\n● Excel/Google Sheets.\n● Аналитическое мышление."}]},{"group":"Финансы","items":[{"title":"Financial Analyst","desc":"Описание:\n● Финансовое планирование.\n● Подготовка отчетов.\n\nТребования:\n● Внимательность.\n● База по финансам."}]},{"group":"Юридический блок","items":[{"title":"Legal Intern","desc":"Описание:\n● Поддержка юридических задач.\n\nТребования:\n● Внимание к деталям.\n● Грамотность."}]},{"group":"Операции","items":[{"title":"Operations Intern","desc":"Описание:\n● Поддержка операционных процессов.\n\nТребования:\n● Ответственность.\n● Аккуратность."}]},{"group":"Продажи","items":[{"title":"Sales Support","desc":"Описание:\n● Поддержка продаж.\n\nТребования:\n● Коммуникация.\n● Готовность учиться."}]},{"group":"Продукт","items":[{"title":"Product Intern","desc":"Описание:\n● Помощь продуктовой команде.\n\nТребования:\n● Системность.\n● Коммуникация."}]},{"group":"Другое","items":[{"title":"Other Non-IT Track","desc":"Описание:\n● Другое направление.\n\nТребования:\n● Мотивация.\n● Готовность учиться."}]}];

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
    const isIT = v === "IT";
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
