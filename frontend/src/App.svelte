<script>
  import { onMount } from 'svelte';
  import { Designer } from '@pdfme/ui';
  import { BLANK_A4_PDF } from '@pdfme/common';
  import { getPlugins } from './plugins';
  import { cloneDeep } from 'lodash-es';
  import { downloadJsonFile, generatePDF, getFontsData, handleLoadTemplate } from './helper';
    import { openTemplateFile, saveTemplateAs, saveTemplateFile } from './filesystem';

  let container;
  let designer;
  let editingStaticSchemas = false;
  let fileHandle = null;

  const loadFont = async (file) =>
    fetch(`/fonts/${file}`).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load font: ${file}`);
      }
      return res.arrayBuffer();
    });

  const readFile = (file, type = 'dataURL') =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      if (type === 'dataURL') reader.readAsDataURL(file);
      else reader.readAsArrayBuffer(file);
    });

  const onChangeBasePDF = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const basePdf = await readFile(file, 'dataURL');

    if (designer) {
      const newTemplate = cloneDeep(designer.getTemplate());
      newTemplate.basePdf = basePdf;
      designer.updateTemplate(newTemplate);
    }
  };

  const onDownloadTemplate = () => {
    if (designer) {
      downloadJsonFile(designer.getTemplate(), "template");
    }
  };

  const handleGeneratePdf = async () => {
    const startTimer = performance.now();
    await generatePDF(designer);
    const endTimer = performance.now();
  };

  const openTemplate = async () => {
    const { handle, template } = await openTemplateFile();
    fileHandle = handle;
    designer.updateTemplate(template);

    console.log(fileHandle);
  };

  const save = async () => {
    const template = designer.getTemplate();
    if (!fileHandle) {
      // If nothing opened yet, fallback to Save As
      fileHandle = await saveTemplateAs(template);
    } else {
      await saveTemplateFile(fileHandle, template);
    }
  };

  const saveAs = async () => {
    const template = designer.getTemplate();
    fileHandle = await saveTemplateAs(template); // now future saves overwrite this file
  };

  const copyTemplateToClipboard = async () => {
    try {
      const template = designer.getTemplate();
      const json = JSON.stringify(template, null, 2);

      await navigator.clipboard.writeText(json);

      alert('Template JSON copied to clipboard');
    } catch (err) {
      console.error(err);
      alert('Failed to copy template JSON');
    }
  };

  onMount(async () => {
    

    designer = new Designer({
      domContainer: container,
      template: {
        basePdf: BLANK_A4_PDF,
        schemas: []
      },
      options: { 
        font: await getFontsData() 
      },
      plugins: getPlugins(),
    });

    // Export helper
    window.getTemplate = () => designer.getTemplate();
  });
</script>

<style>
  :global(html, body, #app) {
    margin: 0;
    height: 100%;
  }

  .designer {
    height: 100vh;
  }
</style>

<div class="flex items-center justify-between p-3">
  <div class="flex items-center gap-5">
    <div class="flex flex-col">
      <div class="text-xs">Base PDF</div>
      <input
        type="file"
        accept="application/pdf"
        disabled={editingStaticSchemas}
        class=" text-sm border rounded px-2 py-1 w-56
          {editingStaticSchemas ? 'opacity-50 cursor-not-allowed' : ''}"
        on:change={onChangeBasePDF}
      />
    </div>

    <!-- <div class="flex flex-col">
      <div class="text-xs">Open Template</div>
      <input
        type="file"
        accept="application/json"
        disabled={editingStaticSchemas}
        class=" text-sm border rounded px-2 py-1 w-56
          {editingStaticSchemas ? 'opacity-50 cursor-not-allowed' : ''}"
        on:change={(e) => handleLoadTemplate(e, designer)}
      />
    </div> -->

  </div>

  <div class="flex items-center gap-5">
    
    
    {#if fileHandle}
      <div>{fileHandle.name}</div>
    {/if}
  

    <button class="px-2 py-1 border rounded hover:bg-gray-300 cursor-pointer " on:click={openTemplate}>
      Open
    </button>

    <button class="px-2 py-1 border rounded hover:bg-gray-300 cursor-pointer " on:click={save}>
      Save
    </button>

    <button class="px-2 py-1 border rounded hover:bg-gray-300 cursor-pointer " on:click={copyTemplateToClipboard}>
      Copy Template
    </button>

    <!-- <button class="px-2 py-1 border rounded" on:click={saveAs}>
      Save As…
    </button> -->
  




    <!-- <button
      disabled={editingStaticSchemas}
      class="px-2 py-1 border rounded hover:bg-gray-100 
        {editingStaticSchemas ? 'opacity-50 cursor-not-allowed' : ''}"
      on:click={onDownloadTemplate}
    >
      DL Template
    </button>
    -->

    <button
      id="generate-pdf"
      disabled={editingStaticSchemas}
      class="px-2 py-1 border rounded hover:bg-gray-300 cursor-pointer 
        {editingStaticSchemas ? 'opacity-50 cursor-not-allowed' : ''}"
      on:click={handleGeneratePdf}
    >
      Generate PDF
    </button> 


  </div>
</div>
<div bind:this={container} class="designer"></div>
