let image;

const inputElement = document.getElementById('image-file');
const canvasElement = document.getElementById('image-canvas');
const context = canvasElement.getContext('2d');

const resizeButton = document.getElementById('resize-button');
const resizeInput = document.getElementById('resize-input');

const histogramCanvas = document.getElementById('histogram-canvas');
const histogramContext = histogramCanvas.getContext('2d');

const saveButton = document.getElementById('save-button');
const cropButton = document.getElementById('crop-button');

const textInput = document.getElementById('text-input');
const textSizeInput = document.getElementById('text-size-input');
const textColorInput = document.getElementById('text-color-input');
const textXInput = document.getElementById('text-x-input');
const textYInput = document.getElementById('text-y-input');

let isSelecting = false;


function buildHistogram(imageData) {
  const data = imageData.data;
  const histogram = {
    r: new Array(256).fill(0),
    g: new Array(256).fill(0),
    b: new Array(256).fill(0)
  };

  for (let i = 0; i < data.length; i += 4) {
    histogram.r[data[i]]++;
    histogram.g[data[i + 1]]++;
    histogram.b[data[i + 2]]++;
  }

  return histogram;
}

function drawHistogram(histogram, width, height) {
  const maxValue = Math.max(...histogram.r, ...histogram.g, ...histogram.b);

  histogramContext.clearRect(0, 0, width, height);

  histogramContext.fillStyle = 'red';
  histogram.r.forEach((value, i) => {
    histogramContext.fillRect(i, height - value / maxValue * height, 1, value / maxValue * height);
  });

  histogramContext.fillStyle = 'green';
  histogram.g.forEach((value, i) => {
    histogramContext.fillRect(i + 256, height - value / maxValue * height, 1, value / maxValue * height);
  });

  histogramContext.fillStyle = 'blue';
  histogram.b.forEach((value, i) => {
    histogramContext.fillRect(i + 512, height - value / maxValue * height, 1, value / maxValue * height);
  });
}

canvasElement.addEventListener('mousemove', (event) => {
  if (!isSelecting || !image) {
    return;
  }

  context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  context.drawImage(image, 0, 0, image.width, image.height,
    0, 0, canvasElement.width, canvasElement.height);
  selection.width = event.offsetX - selection.x;
  selection.height = event.offsetY - selection.y;

  context.strokeStyle = '#ffffff';
  context.strokeRect(selection.x, selection.y, selection.width, selection.height);

  const imageData = context.getImageData(selection.x, selection.y, selection.width, selection.height);
  const histogram = buildHistogram(imageData);
  drawHistogram(histogram, histogramCanvas.width, histogramCanvas.height);
});


saveButton.addEventListener('click', () => {
  const imageData = canvasElement.toDataURL();
  const linkElement = document.createElement('a');
  linkElement.setAttribute('download', 'edited-image.jpg');
  linkElement.href = imageData;

  linkElement.click();
});


canvasElement.addEventListener('dragover', (event) => {
  event.preventDefault();
});

canvasElement.addEventListener('drop', (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    image = new Image();
    image.src = reader.result;
    image.addEventListener('load', () => {
      canvasElement.width = image.width;
      canvasElement.height = image.height;
      context.drawImage(image, 0, 0, image.width, image.height,
        0, 0, canvasElement.width, canvasElement.height);
    });
  });
  reader.readAsDataURL(file);
});

const dragDropMessage = document.getElementById('drag-drop-function');

canvasElement.addEventListener('dragover', (event) => {
  event.preventDefault();
  dragDropMessage.style.display = 'block';
});

canvasElement.addEventListener('dragleave', (event) => {
  event.preventDefault();
  dragDropMessage.style.display = 'none';
});

resizeButton.addEventListener('click', () => {

  const newWidthInput = document.getElementById('resize-width')
  const newWidth = parseInt(newWidthInput.value);
  const newHeightInput = document.getElementById('resize-height');
  const newHeight = parseInt(newHeightInput.value);


  canvasElement.width = newWidth;
  canvasElement.height = newHeight;


  context.drawImage(image, 0, 0, image.width, image.height,
    0, 0, newWidth, newHeight);
});

inputElement.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (fileEvent) => {
    image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);
      context.drawImage(image, 0, 0, image.width, image.height,
        0, 0, canvasElement.width, canvasElement.height);
    };
    image.src = fileEvent.target.result;
  };

  reader.readAsDataURL(file);
});

let selection = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};



canvasElement.addEventListener('mousedown', (event) => {
  isSelecting = true;
  selection.x = event.offsetX;
  selection.y = event.offsetY;
});

canvasElement.addEventListener('mousemove', (event) => {
  if (!isSelecting || !image) {
    return;
  }

  context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  context.drawImage(image, 0, 0, image.width, image.height,
    0, 0, canvasElement.width, canvasElement.height);
  selection.width = event.offsetX - selection.x;
  selection.height = event.offsetY - selection.y;

  context.strokeStyle = '#ffffff';
  context.strokeRect(selection.x, selection.y, selection.width, selection.height);
});

canvasElement.addEventListener('mouseup', (event) => {
  isSelecting = false;
});



cropButton.addEventListener('click', () => {
  if (selection.width <= 0 || selection.height <= 0) {
    return;
  }

  const imageData = context.getImageData(selection.x, selection.y, selection.width, selection.height);
  context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  context.putImageData(imageData, 0, 0);
});

const effectButton = document.getElementById('effect-button');
const effectSelect = document.getElementById('effect-select');

effectButton.addEventListener('click', () => {
  if (selection.width <= 0 || selection.height <= 0) {
    return;
  }

  const imageData = context.getImageData(selection.x, selection.y, selection.width, selection.height);
  const data = imageData.data;

  switch (effectSelect.value) {
    case 'none':

      break;
    case 'greyscale':
      for (let i = 0; i < data.length; i += 4) {
        const average = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = average;
        data[i + 1] = average;
        data[i + 2] = average;
      }
      break;
    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      break;
    case 'darken':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] / 2;
        data[i + 1] = data[i + 1] / 2;
        data[i + 2] = data[i + 2] / 2;
      }
      break;
    case 'contrast':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = (data[i] - 128) * 2 + 128;
        data[i + 1] = (data[i + 1] - 128) * 2 + 128;
        data[i + 2] = (data[i + 2] - 128) * 2 + 128;
      }
      break;
    default:
      break;

  }

  context.putImageData(imageData, 0, 0);
});

const addTextButton = document.getElementById('add-text-button');
addTextButton.addEventListener('click', () => {
  context.font = `${textSizeInput.value}px sans-serif`;
  context.fillStyle = textColorInput.value;
  context.fillText(textInput.value, textXInput.value, textYInput.value);
});
