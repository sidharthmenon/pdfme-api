import { checkTemplate } from '@pdfme/common';

/**
 * Open a local JSON template file
 */
export const openTemplateFile = async () => {
  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'PDF Template JSON',
        accept: { 'application/json': ['.json'] }
      }
    ],
    excludeAcceptAllOption: true,
    multiple: false
  });

  const file = await handle.getFile();
  const text = await file.text();
  const template = JSON.parse(text);

  checkTemplate(template);

  return { handle, template };
};

/**
 * Save template back to the same file
 */
export const saveTemplateFile = async (fileHandle, template) => {
  if (!fileHandle) {
    throw new Error('No file opened');
  }

  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(template, null, 2));
  await writable.close();
};

export const saveTemplateAs = async (template) => {
  // Optional validation before saving
  checkTemplate(template);

  const handle = await window.showSaveFilePicker({
    suggestedName: 'template.json',
    types: [
      {
        description: 'PDF Template JSON',
        accept: { 'application/json': ['.json'] }
      }
    ]
  });

  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(template, null, 2));
  await writable.close();

  return handle; // important: keep this for future saves
};