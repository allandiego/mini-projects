async function getTextFromPage(pageNum, pdfDocumentInstance) {
  try {
    const pdfPage = await pdfDocumentInstance.getPage(pageNum);
    const textContent = await pdfPage.getTextContent();

    const pageText = textContent.items.map(item => item.str).join('');

    return pageText;
  } catch (error) {
    console.log(error);
  }

  return '';
}

const onLoadFile = async event => {
  try {
    // turn array buffer into typed array
    const typedArray = new Uint8Array(event.target.result);

    const loadingPdfDocument = pdfjsLib.getDocument(typedArray);
    const pdfDocumentInstance = await loadingPdfDocument.promise;

    const totalNumPages = pdfDocumentInstance.numPages;
    const pagesPromises = [];

    for (let currentPage = 1; currentPage <= totalNumPages; currentPage += 1) {
      pagesPromises.push(getTextFromPage(currentPage, pdfDocumentInstance));
    }

    const pagesData = await Promise.all(pagesPromises);
    // console.log(pagesData.join(' '));

    const pdfData = extractDataFromPdf(pagesData);

    document.getElementById('output-data').innerHTML = JSON.stringify(pdfData, null, 2);
    document.getElementById('output-raw').innerHTML = pagesData.join(' ');

  } catch (error) {
    console.log(error);
  }
};

document.getElementById('file-pdf').addEventListener('change', event => {
  const file = event.target.files[0];

  if (file.type !== 'application/pdf') {
    alert(`O arquivo ${file.name} não é do tipo PDF`);
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = onLoadFile;
  fileReader.readAsArrayBuffer(file);
});


//layot1 = table with borders
function isLayout1(inputText) {
  const LAYOUT1_REGEX = /(\d{2}\/\d{2}\/\d{4})\s{0,}([a-zA-Z0-9_\s\-\/]+\d{1}\,\d{6})\s{0,}(-{0,1}\s{0,}[0-9]\d{0,2}(?:(?:\.\d{3})*),\d{2})\s{0,1}\s{0,}(-{0,1}[0-9]\d{0,2}(?:(?:\.\d{3})*),\d{2})/gm;
  return LAYOUT1_REGEX.test(inputText);
}

function extractDataFromLayout1(inputText) {
  const LAYOUT1_REGEX = /(\d{2}\/\d{2}\/\d{4})\s{0,}([a-zA-Z0-9_\s\-\/]+\d{1}\,\d{6})\s{0,}(-{0,1}\s{0,}[0-9]\d{0,2}(?:(?:\.\d{3})*),\d{2})\s{0,1}\s{0,}(-{0,1}[0-9]\d{0,2}(?:(?:\.\d{3})*),\d{2})/gm;
  const matches = [...inputText.matchAll(LAYOUT1_REGEX)];

  const entries = matches.map((match) => {
    const entry = {
      data: match[1] ? match[1].toString().trim() : '',
      descricao: match[2] ? match[2].toString().trim() : '',
      valor: match[3] ? match[3].toString().trim() : '',
      saldo: match[4] ? match[4].toString().trim() : '',
    };
    return entry;
  });

  const lancamentos = entries.filter(entry => entry.descricao.includes('DE JAM'));

  const regexName = /(?:NOME:{0,1}){0,1}\s{0,}([a-zA-Z\s]+)\s{0,}(?:PIS\/PASEP:{1})\s{0,}(?:.*)\s{0,}(?:EMPRESA:)/m;
  const hasName = regexName.test(inputText);
  const name = hasName ? inputText.match(regexName)[1].toString().trim() : '';

  const totalValor = lancamentos.reduce((acc, curr) => acc + Number(curr.valor.replaceAll('.', '').replace(',', '.')), 0).toFixed(2);
  const totalContagem = lancamentos.length;

  const result = {
    tipoLayout: 'layout1',
    nome: name,
    totalValor,
    totalContagem,
    lancamentos,
  };

  return result;
}

//layout2 = table without border and monetary symbol
function isLayout2(inputText) {
  const LAYOUT2_REGEX = /(\d{2}\/\d{2}\/\d{4})\s{0,}([a-zA-Z0-9_\s\-\/]+\d{1}\,\d{6}|[a-zA-Z0-9_\s\-\/]+\/\d{4}|[a-zA-Z0-9_\s\-\.\/]+)\s{0,}(?:R\$){1}\s{0,}(-{0,1}\s{0,}[0-9]\d{0,2}(?:(?:\.\d{3})*),\d{2})\s{0,1}(?:R\$){1}\s{0,}(-{0,1}[0-9]\d{0,2}(?:(?:\.\d{3})*),\d{2})/gm;
  return LAYOUT2_REGEX.test(inputText);
}

function extractDataFromLayout2(inputText) {
  const LAYOUT2_REGEX = /(\d{2}\/\d{2}\/\d{4})\s{0,}([a-zA-Z0-9_\s\-\/]+\d{1}\,\d{6}|[a-zA-Z0-9_\s\-\/]+\/\d{4}|[a-zA-Z0-9_\s\-\.\/]+)\s{0,}(?:R\$){1}\s{0,}(-{0,1}\s{0,}[0-9]\d{0,2}(?:(?:\.\d{3})*),\d{2})\s{0,1}(?:R\$){1}\s{0,}(-{0,1}[0-9]\d{0,2}(?:(?:\.\d{3})*),\d{2})/gm;
  const matches = [...inputText.matchAll(LAYOUT2_REGEX)];

  const entries = matches.map((match) => {
    const entry = {
      data: match[1] ? match[1].toString().trim() : '',
      descricao: match[2] ? match[2].toString().trim() : '',
      valor: match[3] ? match[3].toString().trim() : '',
      saldo: match[4] ? match[4].toString().trim() : '',
    };
    return entry;
  });

  const lancamentos = entries.filter(entry => entry.descricao.includes('DE JAM'));

  const regexName = /([a-zA-Z\s]+)\s{0,}(?:[^DO\s{0,}])(?:EMPREGADOR)/m;
  const hasName = regexName.test(inputText);
  const name = hasName ? inputText.match(regexName)[1].toString().trim() : '';

  const totalValor = lancamentos.reduce((acc, curr) => acc + Number(curr.valor.replaceAll('.', '').replace(',', '.')), 0).toFixed(2);
  const totalContagem = lancamentos.length;

  const result = {
    tipoLayout: 'layout2',
    nome: name,
    totalValor,
    totalContagem,
    lancamentos,
  };

  return result;
}

//layout3 = column
function isLayout3(inputText) {
  const LAYOUT3_REGEX = /(\d{2}\/\d{2}\/\d{4})\s{0,}([a-zA-Z0-9_\s\-\/]+\d{1}\,\d{6})\s{0,}((:?R\$){0,1}\s{0,}(-{0,1}\s{0,}[0-9]\d{0,2}(:?(:?\.\d{3})*),\d{2})\s{0,1})/gm;
  return LAYOUT3_REGEX.test(inputText);
}

function extractDataFromLayout3(inputText) {
  const LAYOUT3_REGEX = /(\d{2}\/\d{2}\/\d{4})\s{0,}([a-zA-Z0-9_\s\-\/]+\d{1}\,\d{6})\s{0,}((:?R\$){0,1}\s{0,}(-{0,1}\s{0,}[0-9]\d{0,2}(:?(:?\.\d{3})*),\d{2})\s{0,1})/gm;
  const matches = [...inputText.matchAll(LAYOUT3_REGEX)];

  const entries = matches.map((match) => {
    const entry = {
      data: match[1] ? match[1].toString().trim() : '',
      descricao: match[2] ? match[2].toString().trim() : '',
      valor: match[3] ? match[3].toString().trim() : '',
      saldo: ''
    };
    return entry;
  });

  const lancamentos = entries.filter(entry => entry.descricao.includes('DE JAM'));

  const regexName = /(?:NOME:{0,1}){0,1}\s{0,}([a-zA-Z\s]+)\s{0,}(?:PIS\/PASEP:{0,1}|\s{0,}(?:EMPREGADOR))/m;
  const hasName = regexName.test(inputText);
  const name = hasName ? inputText.match(regexName)[1].toString().trim() : '';

  const totalValor = lancamentos.reduce((acc, curr) => acc + Number(curr.valor.replaceAll('.', '').replace(',', '.')), 0).toFixed(2);
  const totalContagem = lancamentos.length;

  const result = {
    tipoLayout: 'layout3',
    nome: name,
    totalValor,
    totalContagem,
    lancamentos,
  };

  return result;
}


function extractDataFromPdf(inputData) {
  const pdfText = inputData.join(' ');
  const inputText = pdfText.toUpperCase();
  const totalPaginas = inputData.length;

  if (isLayout1(inputText)) {
    const data = extractDataFromLayout1(inputText);
    return { totalPaginas, ...data };
  }

  if (isLayout2(inputText)) {
    const data = extractDataFromLayout2(inputText);
    return { totalPaginas, ...data };
  }

  if (isLayout3(inputText)) {
    const data = extractDataFromLayout3(inputText);
    return { totalPaginas, ...data };
  }

  const result = {
    tipoLayout: 'desconhecido',
    nome: '',
    totalValor: 0,
    totalContagem: 0,
    totalPaginas: 0,
    lancamentos: [],
  };

  return result;
}