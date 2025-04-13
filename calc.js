//-----------------------------------//
//-----Визуальные приколдесы тут-----//
//-----------------------------------//

// Форматирование числа в инпуте
function formatNumberInput(input) {
  const cursorPosition = input.selectionStart;
  const originalLength = input.value.length;
  const endsWithDot = input.value.endsWith('.');

  let value = input.value.replace(/[^0-9.]/g, '');

  const parts = value.split('.');

  let integerPart = parts[0] || '';
  let decimalPart =
    parts.length > 1 ? parts.slice(1).join('') : '';

  integerPart = integerPart
    ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    : '';

  if (decimalPart) {
    decimalPart = decimalPart.slice(0, 2);
  }

  let formattedValue = decimalPart
    ? `${integerPart}.${decimalPart}`
    : integerPart;

  if (endsWithDot) {
    formattedValue += '.';
  }

  input.value = formattedValue;
  const cursorOffset = formattedValue.length - originalLength;
  const newCursorPosition = cursorPosition + cursorOffset;
  input.setSelectionRange(newCursorPosition, newCursorPosition);
}

const smrInput = document.getElementById('smr');
const goInput = document.getElementById('go');

smrInput.addEventListener('input', () => {
  formatNumberInput(smrInput);
});
goInput.addEventListener('input', () => {
  formatNumberInput(goInput);
});

// Обработка UI при выборе кнопок
function changeMenu() {
  document
    .querySelectorAll('input[name="tariff"]')
    .forEach((radioButton) => {
      radioButton.addEventListener('change', () => {
        const smrGroup = document.getElementById('smr_group');
        const goGroup = document.getElementById('go_group');
        if (radioButton.id === 'only_smr') {
          smrGroup.style.display = 'flex';
          goGroup.style.display = 'none';
        }
        if (radioButton.id === 'only_go') {
          goGroup.style.display = 'flex';
          smrGroup.style.display = 'none';
        }
        if (radioButton.id === 'smr_and_go') {
          goGroup.style.display = 'flex';
          smrGroup.style.display = 'flex';
        }
      });
    });
}

// Ресет
function radioCheker() {
  const selectedRadio = document.querySelector(
    'input[name="tariff"]:checked',
  );
  if (selectedRadio) {
    selectedRadio.dispatchEvent(new Event('change'));
  } else {
    console.error(
      'Ошибка: ни одна радиокнопка не выбрана при загрузке страницы',
    );
  }
}

changeMenu();
radioCheker();

//-----------------------------------//
//----------Калькулятор тут----------//
//-----------------------------------//

// Кнопка для обработки
const calcButton = document.getElementById('calc_button');

function getSoloPercentRate(sumValue) {
  if (sumValue <= 5000000.01) return 0.004;
  if (sumValue <= 10000000.01) return 0.002;
  if (sumValue <= 20000000.01) return 0.0018;
  if (sumValue <= 30000000.01) return 0.0017;
  return 0.0016;
}

function getDublePercentRate(sumValue) {
  if (sumValue <= 5000000.01) return 0.0025;
  if (sumValue <= 10000000.01) return 0.0015;
  if (sumValue <= 20000000.01) return 0.0013;
  if (sumValue <= 30000000.01) return 0.0011;
  return 0.001;
}

function calculatePremium() {
  const tariff = document.querySelector(
    'input[name="tariff"]:checked',
  ).value;
  // Инпут с СС СМР
  const sumSmrInput = document.getElementById('smr');

  // Инпут с СС ГО
  const sumGoInput = document.getElementById('go');

  // Блок для вывода результата
  const resultDiv = document.querySelector('.result');

  const sumSmr =
    parseFloat(sumSmrInput.value.replace(/\s/g, '')) || 0;
  const sumGo =
    parseFloat(sumGoInput.value.replace(/\s/g, '')) || 0;

  let premium = 0;
  let showNotice = false;

  if (tariff === 'only_smr') {
    if (sumSmr <= 0) {
      resultDiv.innerHTML =
        '<span class="error">Пожалуйста, введите корректную сумму для СМР (положительное число).</span>';
      return;
    }
    if (sumSmr >= 30000000) {
      showNotice = true;
    }
    const rateSmr = getSoloPercentRate(sumSmr);
    premium = sumSmr * rateSmr;
  } else if (tariff === 'only_go') {
    if (sumGo <= 0) {
      resultDiv.innerHTML =
        '<span class="error">Пожалуйста, введите корректную сумму для ГО (положительное число).</span>';
      return;
    }
    if (sumGo >= 30000000) {
      showNotice = true;
    }
    const rateGo = getSoloPercentRate(sumGo);
    premium = sumGo * rateGo;
  } else if (tariff === 'smr_and_go') {
    if (sumSmr <= 0) {
      resultDiv.innerHTML =
        '<span class="error">Пожалуйста, введите корректную сумму для СМР (положительное число).</span>';
      return;
    }
    if (sumGo <= 0) {
      resultDiv.innerHTML =
        '<span class="error">Пожалуйста, введите корректную сумму для ГО (положительное число).</span>';
      return;
    }
    if (
      sumSmr >= 30000000 ||
      sumGo >= 30000000 ||
      sumSmr + sumGo >= 30000000
    ) {
      showNotice = true;
    }
    const rateSmr = getDublePercentRate(sumSmr);
    const rateGo = getDublePercentRate(sumGo);
    premium = sumSmr * rateSmr + sumGo * rateGo;
  }

  // Обработка результата по ТЗ
  // (если результат < 10к, то выводим 10к,
  // если в инпуте >= 30000000, то добавляем уведомление)

  if (premium > 10000) {
    const formattedPremium = premium
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    let resultText = `${formattedPremium} руб.`;
    if (showNotice) {
      resultText +=
        'Примерный расчет. Для сумм свыше 30 млн. необходимо уточнение';
    }
    resultDiv.innerHTML = resultText;
  } else {
    let resultText = '10 000 руб.';
    if (showNotice) {
      resultText +=
        'Примерный расчет. Для сумм свыше 30 млн. необходимо уточнение';
    }
    resultDiv.innerHTML = resultText;
  }
}

// Вызов функции калькулятора
calcButton.addEventListener('click', () => {
  calculatePremium();
});
