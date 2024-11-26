document.addEventListener('DOMContentLoaded', function () {
  const blockX = document.querySelector('.block1 .X');
  const blockY = document.querySelector('.block6 .Y');
  const temp = blockX.innerHTML;
  blockX.innerHTML = blockY.innerHTML;
  blockY.innerHTML = temp;

  document.getElementById('calculateArea').addEventListener('click', calculateAreaHandler);

  initializeBlocksFromLocalStorage();

  const cookieData = document.cookie.replace(/(?:(?:^|.*;\s*)maxValues\s*=\s*([^;]*).*$)|^.*$/, "$1");
  if (cookieData) {
    const confirmed = confirm('Do you want to delete saved data?');
    if (confirmed) {
      clearCookies();
      document.cookie = "maxValues=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      location.reload();
    } else {
      alert('Data is still in cookies. Please reload the page.');
    }
  }

  const form = document.getElementById('maxNumbersForm');
  form.addEventListener('submit', maxNumbersSubmitHandler);
});

function calculateAreaHandler() {
  const radius = parseFloat(document.getElementById('radius').value);
  if (!isNaN(radius) && radius > 0) {
    if (radius <= 10000000000) {
      const area = Math.PI * Math.pow(radius, 2);
      document.getElementById('circleArea').innerText = 'Area of the circle: ' + area.toFixed(2);
    } else {
      document.getElementById('circleArea').innerText = 'Area of the circle: enter 10000000000 or less';
    }
  } else {
    alert('Please enter a valid radius');
  }
}

function maxNumbersSubmitHandler(event) {
  event.preventDefault();
  const form = event.target;
  let numbers = [];
  let hasError = false;

  // Loop through all input fields
  for (let i = 1; i <= 10; i++) {
    const value = form[`num${i}`].value;
    if (value === '' || isNaN(value)) {
      hasError = true; // If any field is empty or not a number, set error flag
      break;
    }
    numbers.push(parseFloat(value));
  }

  if (hasError) {
    alert("Error: All fields must contain numbers.");
  } else {
    const max = Math.max(...numbers);
    const maxCount = numbers.filter(num => num === max).length;
    alert(`Maximum value: ${max}, Count: ${maxCount}`);
    document.cookie = `maxValues=${maxCount}; path=/`;
  }
}

function initializeBlocksFromLocalStorage() {
  for (let i = 1; i <= 6; i++) {
    const block = document.querySelector(`.block${i}`);
    const savedContent = localStorage.getItem(`block${i}Content`);
    if (savedContent) {
      block.innerHTML = savedContent;
      addResetButton(block, i);
    }
    block.dataset.originalContent = block.innerHTML;
    block.addEventListener('dblclick', () => enableEditing(i));
  }

  const savedColor = localStorage.getItem('block2Color');
  if (savedColor) {
    document.querySelector('.block2').style.backgroundColor = savedColor;
  }

  const colorPicker = document.getElementById('colorPicker');
  colorPicker.addEventListener('blur', handleColorChange);
  colorPicker.disabled = false;
}

function handleColorChange() {
  const block = document.querySelector('.block2');
  if (block.classList.contains('editing')) {
    alert('You cannot change the color while editing.');
    return;
  }

  const color = document.getElementById('colorPicker').value;
  block.style.backgroundColor = color;
  localStorage.setItem('block2Color', color);
}

function addResetButton(block, blockId) {
  if (block.querySelector(".resetButton")) return;

  const resetButton = document.createElement("button");
  resetButton.innerText = "Reset";
  resetButton.classList.add("resetButton");
  resetButton.addEventListener("click", function () {
    resetBlockContent(block, blockId);
    enableColorEditing();
  });
  block.appendChild(resetButton);
}

function resetBlockContent(block, blockId) {
  block.innerHTML = block.dataset.originalContent || '';
  block.classList.remove("editing");
  if (blockId === 2) {
    block.style.backgroundColor = '#f9d5b5';
  } else {
    block.style.backgroundColor = '';
  }
  localStorage.removeItem(`block${blockId}Content`);
  localStorage.removeItem('block2Color');
  reinitializeEvents();
}

function enableColorEditing() {
  const colorPicker = document.getElementById('colorPicker');
  colorPicker.disabled = false;
}

function enableEditing(blockId) {
  const block = document.querySelector(`.block${blockId}`);
  if (block.classList.contains('editing')) return;

  const originalContent = block.dataset.originalContent || block.innerHTML;

  block.classList.add('editing');
  block.innerHTML = `
    <textarea>${originalContent}</textarea>
    <button id="save${blockId}">Save</button>
    <button id="cancel${blockId}">Cancel</button>
  `;

  document.getElementById(`save${blockId}`).addEventListener('click', function () {
    const newContent = block.querySelector('textarea').value;
    block.innerHTML = newContent;
    block.style.backgroundColor = 'white';
    localStorage.setItem(`block${blockId}Content`, newContent);
    block.dataset.originalContent = originalContent;
    block.classList.remove('editing');
    addResetButton(block, blockId);
    reinitializeEvents();
  });

  document.getElementById(`cancel${blockId}`).addEventListener('click', function () {
    block.innerHTML = originalContent;
    block.style.backgroundColor = '';
    block.classList.remove('editing');
    reinitializeEvents();
  });
}

function clearCookies() {
  let cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    let eqPos = cookie.indexOf("=");
    let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }
  localStorage.clear();
  reinitializeEvents();
}

function reinitializeEvents() {
  const calculateButton = document.getElementById('calculateArea');
  if (calculateButton) {
    calculateButton.removeEventListener('click', calculateAreaHandler);
    calculateButton.addEventListener('click', calculateAreaHandler);
  }

  const form = document.getElementById('maxNumbersForm');
  if (form) {
    form.removeEventListener('submit', maxNumbersSubmitHandler);
    form.addEventListener('submit', maxNumbersSubmitHandler);
  }
  colorPicker.removeEventListener('blur', handleColorChange);
  colorPicker.addEventListener('blur', handleColorChange);

}
