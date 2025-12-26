import {
  checkTemplate,
  getInputFromTemplate,
  getDefaultFont,
} from '@pdfme/common';

import { generate } from '@pdfme/generator';
import { Designer, Form, Viewer } from '@pdfme/ui';
import { getPlugins } from './plugins';

/* ------------------------------------------------------------------
 * Utils
 * ------------------------------------------------------------------ */

export const fromKebabCase = (str) =>
  str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/* ------------------------------------------------------------------
 * Fonts
 * ------------------------------------------------------------------ */
const loadFont = async (file) =>
    fetch(`/fonts/${file}`).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load font: ${file}`);
      }
      return res.arrayBuffer();
    });

export const getFontsData = async () => ({
  ...getDefaultFont(),

  Roboto: {
    data: await loadFont('Roboto-Regular.ttf'),
    fallback: true
  },

  Montserrat: {
    data: await loadFont('Montserrat-Regular.ttf')
  },

  'Crimson Text': {
    data: await loadFont('CrimsonText-Regular.ttf')
  },

  'Archivo Black': {
    data: await loadFont('ArchivoBlack-Regular.ttf')
  },

  'Kaushan Script': {
    data: await loadFont('KaushanScript-Regular.ttf')
  },

  Engagement: {
    data: await loadFont('Engagement-Regular.ttf')
  },

  Pacifico: {
    data: await loadFont('Pacifico-Regular.ttf')
  }

});

/* ------------------------------------------------------------------
 * File helpers
 * ------------------------------------------------------------------ */

export const readFile = (file, type) =>
  new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    if (type === 'text') reader.readAsText(file);
    else if (type === 'dataURL') reader.readAsDataURL(file);
    else if (type === 'arrayBuffer') reader.readAsArrayBuffer(file);
  });

export const getTemplateFromJsonFile = async (file) => {
  const jsonStr = await readFile(file, 'text');
  const template = JSON.parse(jsonStr);
  checkTemplate(template);
  return template;
};

/* ------------------------------------------------------------------
 * Template load / save
 * ------------------------------------------------------------------ */

export const handleLoadTemplate = async (event, currentInstance) => {
  const file = event.target?.files?.[0];
  if (!file || !currentInstance) return;

  try {
    const template = await getTemplateFromJsonFile(file);
    currentInstance.updateTemplate(template);
  } catch (err) {
    alert(`Invalid template file.
--------------------------
${err}`);
  }
};

export const downloadJsonFile = (json, title) => {
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.json`;
  link.click();

  URL.revokeObjectURL(url);
};

/* ------------------------------------------------------------------
 * PDF generation
 * ------------------------------------------------------------------ */

export const generatePDF = async (currentInstance) => {
  if (!currentInstance) return;

  const template = currentInstance.getTemplate();
  const options = currentInstance.getOptions();

  const inputs =
    typeof currentInstance.getInputs === 'function'
      ? currentInstance.getInputs()
      : getInputFromTemplate(template);

  const font = await getFontsData();

  try {
    const pdf = await generate({
      template,
      inputs,
      options: {
        font,
        title: 'pdfme',
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  } catch (err) {
    alert(err + '\n\nCheck the console for full stack trace');
    throw err;
  }
};

export const isJsonString = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const getBlankTemplate = () => ({
  schemas: [{}],
  basePdf: {
    width: 210,
    height: 297,
    padding: [20, 10, 20, 10],
  },
});
