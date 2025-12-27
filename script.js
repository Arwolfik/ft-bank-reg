const form = document.getElementById('reg-form');

function getTelegramUserId() {
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    if (user && user.id) return user.id;
  }
  return null;
}

function normalizePhone(raw) {
  return String(raw || '').replace(/[^\d+]/g, '');
}

function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email || '').trim());
}

function isValidPhone(phone) {
  const p = normalizePhone(phone);
  // Allow +... or digits, with at least 7 digits total
  const digits = p.replace(/\D/g, '');
  return digits.length >= 7;
}

const ids = {
  tgHint: document.getElementById('tg-hint'),
  city: document.getElementById('city'),
  cityOther: document.getElementById('city_other'),
  timeDiffBlock: document.getElementById('time_diff_block'),
  timeDiff: document.getElementById('time_diff'),
  citizen: document.getElementById('citizen'),
  citizenOther: document.getElementById('citizen_other'),
  degree: document.getElementById('degree'),
  gradYearBlock: document.getElementById('grad_year_block'),
  gradYear: document.getElementById('grad_year'),
  internship: document.getElementById('internship'),
  onlineCoursesBlock: document.getElementById('online_courses_block'),
  onlineCourses: document.getElementById('online_courses'),
  onlineYearBlock: document.getElementById('online_year_block'),
  onlineYear: document.getElementById('online_year'),
  onlineYearOther: document.getElementById('online_year_other'),
  prioritiesIT: document.getElementById('priorities_it'),
  prioritiesBusiness: document.getElementById('priorities_business'),
  priority1IT: document.getElementById('priority1_it'),
  priority2IT: document.getElementById('priority2_it'),
  priority1Business: document.getElementById('priority1_business'),
  priority2Business: document.getElementById('priority2_business'),
  errorEl: document.getElementById('reg-error')
};

function setVisible(el, visible) {
  if (!el) return;
  el.style.display = visible ? 'block' : 'none';
}

function clearValue(el) {
  if (!el) return;
  if (el.tagName === 'SELECT') el.value = '';
  else el.value = '';
}

function updateCityUI() {
  const isOther = ids.city.value === 'Другой';
  setVisible(ids.cityOther, isOther);
  setVisible(ids.timeDiffBlock, isOther);
  ids.timeDiff.required = isOther;
  if (!isOther) {
    clearValue(ids.cityOther);
    clearValue(ids.timeDiff);
  }
}

function updateCitizenUI() {
  const isOther = ids.citizen.value === 'Другое';
  setVisible(ids.citizenOther, isOther);
  ids.citizenOther.required = isOther;
  if (!isOther) clearValue(ids.citizenOther);
}

function updateGradYearUI() {
  const hide = ids.degree.value === 'Среднее общее (школа)';
  setVisible(ids.gradYearBlock, !hide);
  ids.gradYear.required = !hide;
  if (hide) clearValue(ids.gradYear);
}

function updateInternshipUI() {
  const v = ids.internship.value;

  // Online courses are asked only for IT
  const isIT = v === 'IT';
  setVisible(ids.onlineCoursesBlock, isIT);
  ids.onlineCourses.required = isIT;
  if (!isIT) {
    clearValue(ids.onlineCourses);
    updateOnlineYearUI();
  }

  // Priorities depend on internship direction
  setVisible(ids.prioritiesIT, isIT);
  setVisible(ids.prioritiesBusiness, v === 'Бизнес');

  // Only one pair should be required at a time
  const itOn = isIT;
  const bizOn = v === 'Бизнес';
  ids.priority1IT.required = itOn;
  ids.priority2IT.required = itOn;
  ids.priority1Business.required = bizOn;
  ids.priority2Business.required = bizOn;

  if (!itOn) {
    clearValue(ids.priority1IT);
    clearValue(ids.priority2IT);
  }
  if (!bizOn) {
    clearValue(ids.priority1Business);
    clearValue(ids.priority2Business);
  }
}

function updateOnlineYearUI() {
  const val = ids.onlineCourses.value;
  const showYear = !!val && val !== 'Не проходил(а)';
  setVisible(ids.onlineYearBlock, showYear);
  ids.onlineYear.required = showYear;
  if (!showYear) {
    clearValue(ids.onlineYear);
    clearValue(ids.onlineYearOther);
    setVisible(ids.onlineYearOther, false);
    ids.onlineYearOther.required = false;
  }
}

function updateOnlineYearOtherUI() {
  const isOther = ids.onlineYear.value === 'Другой';
  setVisible(ids.onlineYearOther, isOther);
  ids.onlineYearOther.required = isOther;
  if (!isOther) clearValue(ids.onlineYearOther);
}

const questionNames = [
  'surname', 'name', 'email', 'phone', 'birthdate',
  'citizen', 'citizen_other',
  'city', 'city_other', 'time_diff',
  'university', 'degree', 'grad_year',
  'specialty', 'internship',
  'online_courses', 'online_year', 'online_year_other',
  'priority1', 'priority2',
  'hours', 'ready_6m'
];

function saveForm() {
  const formData = new FormData(form);
  const data = {};
  questionNames.forEach((qName) => {
    data[qName] = formData.get(qName) || '';
  });
  localStorage.setItem('reg_form_data', JSON.stringify(data));
}

function restoreForm() {
  const saved = JSON.parse(localStorage.getItem('reg_form_data') || '{}');
  questionNames.forEach((qName) => {
    const input = form.elements[qName];
    if (input && saved[qName] != null && saved[qName] !== '') input.value = saved[qName];
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Telegram init (safe in browser too)
  try {
    Telegram.WebApp.ready();
    window.tgUserId = getTelegramUserId();
    window.tgUserStartParam = Telegram.WebApp.initDataUnsafe?.start_param || '';

    if (window.tgUserId && ids.tgHint) {
      ids.tgHint.textContent = `ID Telegram: ${window.tgUserId}`;
      ids.tgHint.style.display = 'block';
    }
  } catch (e) {
    // ignore
  }

  restoreForm();

  // UI bindings
  ids.city.addEventListener('change', updateCityUI);
  ids.citizen.addEventListener('change', updateCitizenUI);
  ids.degree.addEventListener('change', updateGradYearUI);
  ids.internship.addEventListener('change', updateInternshipUI);
  ids.onlineCourses.addEventListener('change', updateOnlineYearUI);
  ids.onlineYear.addEventListener('change', updateOnlineYearOtherUI);

  // Apply initial visibility based on restored values
  updateCityUI();
  updateCitizenUI();
  updateGradYearUI();
  updateInternshipUI();
  updateOnlineYearUI();
  updateOnlineYearOtherUI();
});

form.addEventListener('input', saveForm);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  ids.errorEl.textContent = '';

  const formData = new FormData(form);

  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();

  if (!isValidEmail(email)) {
    ids.errorEl.textContent = 'Введи корректный e-mail (user@domain.com)';
    return;
  }
  if (!isValidPhone(phone)) {
    ids.errorEl.textContent = 'Введи корректный номер телефона';
    return;
  }

  // Values with "other"
  let citizen = String(formData.get('citizen') || '');
  if (citizen === 'Другое') citizen = String(formData.get('citizen_other') || '').trim();

  let city = String(formData.get('city') || '');
  if (city === 'Другой') city = String(formData.get('city_other') || '').trim();

  let onlineYear = String(formData.get('online_year') || '');
  if (onlineYear === 'Другой') onlineYear = String(formData.get('online_year_other') || '').trim();

  // Priorities (depend on internship)
  const internship = String(formData.get('internship') || '');
  const priority1 = internship === 'IT'
    ? String(formData.get('priority1') || '')
    : String(formData.get('priority1') || '');
  const priority2 = internship === 'IT'
    ? String(formData.get('priority2') || '')
    : String(formData.get('priority2') || '');

  const payload = {
    "E-mail": email,
    "Фамилия": String(formData.get('surname') || '').trim(),
    "Имя": String(formData.get('name') || '').trim(),
    "Номер телефона": normalizePhone(phone),
    "Дата рождения": String(formData.get('birthdate') || ''),
    "Гражданство": citizen,
    "Город проживания": city,
    "Разница во времени относительно московского часового пояса": String(formData.get('time_diff') || ''),
    "Наименование вуза": String(formData.get('university') || '').trim(),
    "Степень образования": String(formData.get('degree') || ''),
    "Год выпуска": String(formData.get('grad_year') || ''),
    "Специальность": String(formData.get('specialty') || ''),
    "Направление стажировки": internship,
    "Вы проходили онлайн-курсы?": String(formData.get('online_courses') || ''),
    "Год окончания прохождения онлайн-курса": onlineYear,
    "Приоритетное направление №1": priority1,
    "Приоритетное направление №2": priority2,
    "Выберите количество часов": String(formData.get('hours') || ''),
    "Готовность к стажировке на 6 месяцев": String(formData.get('ready_6m') || ''),
    "tg-id": window.tgUserId || null,
    "start-param": window.tgUserStartParam || ''
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  const oldText = submitBtn.textContent;
  submitBtn.textContent = 'ОТПРАВЛЯЕТСЯ...';

  try {
    const res = await fetch('https://ndb.fut.ru/api/v2/tables/m6tyxd3346dlhco/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'xc-token': 'crDte8gB-CSZzNujzSsy9obQRqZYkY3SNp8wre88'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `HTTP ${res.status}`);
    }

    localStorage.removeItem('reg_form_data');
    window.location.href = 'bye.html';
  } catch (err) {
    console.error(err);
    ids.errorEl.textContent = 'Ошибка сервера. Повтори попытку позже';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = oldText;
  }
});
