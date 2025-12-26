import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDefaultFont } from '@pdfme/common';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontPath = (file) => path.join(__dirname+"/fonts/", file);

/**
 * Backend font configuration for pdfme generator
 * - Supports fontWeight (normal / bold)
 * - Font names MUST match Designer exactly
 */
export const getFontsData = () => ({
  ...getDefaultFont(),

  Roboto: {
    fallback: true,
    data: fs.readFileSync(fontPath('Roboto-Regular.ttf')),
  },

  Montserrat: {
    fallback: false,
    data: fs.readFileSync(fontPath('Montserrat-Regular.ttf')),
  },

  'Crimson Text': {
    fallback: false,
    data: fs.readFileSync(fontPath('CrimsonText-Regular.ttf')),
  },

  'Archivo Black': {
    fallback: false,
    data: fs.readFileSync(fontPath('ArchivoBlack-Regular.ttf'))
  },

  'Kaushan Script': {
    fallback: false,
    data: fs.readFileSync(fontPath('KaushanScript-Regular.ttf'))
  },

  Engagement: {
    fallback: false,
    data: fs.readFileSync(fontPath('Engagement-Regular.ttf'))
  },

  Pacifico: {
    fallback: false,
    data: fs.readFileSync(fontPath('Pacifico-Regular.ttf'))
  }
});
