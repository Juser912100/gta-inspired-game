const canvas = document.getElementById('editorCanvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('imageUpload');
const emptyState = document.getElementById('emptyState');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

const controls = {
  brightness: document.getElementById('brightness'),
  contrast: document.getElementById('contrast'),
  saturation: document.getElementById('saturation'),
  sepia: document.getElementById('sepia'),
  grayscale: document.getElementById('grayscale'),
  blur: document.getElementById('blur')
};

const values = {
  brightness: document.getElementById('brightnessValue'),
  contrast: document.getElementById('contrastValue'),
  saturation: document.getElementById('saturationValue'),
  sepia: document.getElementById('sepiaValue'),
  grayscale: document.getElementById('grayscaleValue'),
  blur: document.getElementById('blurValue')
};

const presetButtons = document.querySelectorAll('.preset');

const baseSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
  blur: 0
};

const presets = {
  original: { ...baseSettings },
  cinematic: { brightness: 92, contrast: 130, saturation: 120, sepia: 12, grayscale: 0, blur: 0 },
  vintage: { brightness: 105, contrast: 95, saturation: 80, sepia: 35, grayscale: 10, blur: 0.2 },
  noir: { brightness: 72, contrast: 155, saturation: 35, sepia: 0, grayscale: 70, blur: 0 },
  warm: { brightness: 110, contrast: 115, saturation: 130, sepia: 18, grayscale: 0, blur: 0 },
  vivid: { brightness: 108, contrast: 120, saturation: 150, sepia: 0, grayscale: 0, blur: 0 }
};

let currentImage = null;
let activePreset = 'original';

function updateValueLabels() {
  Object.entries(controls).forEach(([key, input]) => {
    const value = Number(input.value);
    if (key === 'blur') {
      values[key].textContent = `${value}px`;
      return;
    }
    values[key].textContent = `${value}%`;
  });
}

function setControls(settings) {
  Object.entries(settings).forEach(([key, value]) => {
    controls[key].value = value;
  });
  updateValueLabels();
}

function applyPreset(name) {
  activePreset = name;
  const preset = presets[name] || presets.original;
  setControls(preset);
  renderImage();

  presetButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.preset === name);
  });
}

function renderImage() {
  if (!currentImage) return;

  const maxWidth = canvas.width;
  const maxHeight = canvas.height;
  const ratio = Math.min(maxWidth / currentImage.width, maxHeight / currentImage.height, 1);
  const drawWidth = currentImage.width * ratio;
  const drawHeight = currentImage.height * ratio;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = buildFilter();
  ctx.drawImage(currentImage, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
  ctx.filter = 'none';

  addVignette();
}

function buildFilter() {
  const brightness = Number(controls.brightness.value);
  const contrast = Number(controls.contrast.value);
  const saturation = Number(controls.saturation.value);
  const sepia = Number(controls.sepia.value);
  const grayscale = Number(controls.grayscale.value);
  const blur = Number(controls.blur.value);

  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) grayscale(${grayscale}%) blur(${blur}px)`;
}

function addVignette() {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.2,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.78
  );

  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.42)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      emptyState.classList.add('hidden');
      renderImage();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

imageUpload.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  loadImage(file);
});

Object.values(controls).forEach((input) => {
  input.addEventListener('input', () => {
    activePreset = 'custom';
    presetButtons.forEach((button) => button.classList.remove('active'));
    updateValueLabels();
    renderImage();
  });
});

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyPreset(button.dataset.preset);
  });
});

resetBtn.addEventListener('click', () => {
  setControls(presets.original);
  activePreset = 'original';
  presetButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.preset === 'original');
  });
  renderImage();
});

downloadBtn.addEventListener('click', () => {
  if (!currentImage) return;
  const link = document.createElement('a');
  link.download = 'modified-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

setControls(presets.original);
canvas.width = 1200;
canvas.height = 800;
