const xlsx = require('node-xlsx').default;
//const ExcelJS = require('exceljs');


const remote = require('@electron/remote');
const { dialog } = remote;
const Swal = require('sweetalert2')
const fs = require('fs')

function loadAppVersion(){
    var $ = jQuery = require("jquery")
    const remote = require('@electron/remote');
    const { app } = remote;

    const appVersion = app.getVersion()

    console.log(appVersion)

    $(document).ready(function(){
        $('#appVersion').html("v"+appVersion);
    });

}

loadAppVersion()

function readExcelFileFlat(sheetName, columnName) {
    // Open a file dialog to select a .xlsx file
    const file = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'All Files', extensions: ['*'] }
    ]
    });

    if (!file) {
        console.log('No file selected.');
        return;
    }

    // Load the .xlsx file using the node-xlsx library
    const workSheets = xlsx.parse(file[0]);

    // Find the sheet with the given name
    const sheet = workSheets.find(sheet => sheet.name === sheetName);

    if (sheet) {
        // Read data from all columns and lines in the sheet
        const data = sheet.data;

        // Find the index of the column with the given name
        const columnIndex = data[0].findIndex(cellValue => cellValue === columnName);

        // Get an array of all values in the column
        const columnValues = data.slice(1).map(row => row[columnIndex]).filter(value => value !== undefined && value !== null && value !== '');

        // Get an array of unique values in the column
        const uniqueValues = [...new Set(columnValues)];

        // Get the Swal result and divide it by each unique value
        Swal.fire({
            title: "Qual o valor que deve ser feito o rateio?",
            text: "Escreva qual deve ser o valor do rateio:",
            input: 'number',
            showCancelButton: true,
        }).then(async (result) => {
            if (result.value) {
                console.log(result.value)
                // Calculate the division results
                const divisionResults = uniqueValues.map(uniqueValue => ({
                    value: uniqueValue,
                    result: result.value / uniqueValues.length,
                }));

                // Generate the HTML table
                const tableRows = divisionResults.map(({ value, result }) => `
                    <td>${value}</td>
                    <td>${result.toFixed(2)}</td>
                `);
                
                const tableHtml = `
                    <div style='display: inline-grid; margin: 30px; min-width: 500px'>
                        
                        <i style='font-size: 49px; color: crimson; cursor: pointer' class='bx bx-x' onclick="this.parentElement.remove()"></i>

                        <h4 style='font-weight: 900'>Tipo do Rateio: Flat</h4>
                        <h4 style='font-weight: 900'>Valor do Rateio: ${result.value}</h4>
                        
                        <table style="border-collapse: collapse; width: auto;">
                            <thead style="background-color: #ff0077; color: white;">
                            <tr>
                                <th style="padding: 8px; text-align: center;">Area</th>
                                <th style="padding: 8px; text-align: center;">Resultado do Rateio</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${tableRows.map((row, index) => `<tr style="text-align:center ;background-color: ${index % 2 == 0 ? 'white' : '#f2f2f2'};">${row}</tr>`).join('')}
                            </tbody>
                        </table>
                        
                        <button style='background-color: #7EAB8E; color: white; margin-top: 30px; font-weight: 700' onclick="exportTableToExcel(this)"> Exportar como XLSX <i style='font-size: 49px' class='bx bx-file-export' ></i> </button>
                    </div>
                `;

                // Get the div element
                const tablesDiv = document.getElementById('table-divs');

                // Append the table HTML to the div element
                tablesDiv.innerHTML += tableHtml;


                

            }
        });
    } else {
        console.log(`Sheet named "${sheetName}" not found.`);
    }
}

// function readExcelFilePerson(sheetName) {
//     const file = dialog.showOpenDialogSync({
//         properties: ['openFile'],
//         filters: [
//             { name: 'Excel Files', extensions: ['xlsx'] },
//             { name: 'All Files', extensions: ['*'] }
//         ]
//     });

//     if (!file) {
//         console.log('No file selected.');
//         return;
//     }

//     const workSheets = xlsx.parse(file[0]);

//     const sheet = workSheets.find(sheet => sheet.name === sheetName);

//     if (sheet) {
//         const data = sheet.data;

//         const areaIndex = data[0].findIndex(cellValue => cellValue === 'Area');
//         const fteIndex = data[0].findIndex(cellValue => cellValue === 'FTE');
//         const traineeIndex = data[0].findIndex(cellValue => cellValue === 'Trainee');

//         const areaValues = data.slice(1).map(row => row[areaIndex]).filter(value => value !== undefined && value !== null && value !== '');
//         const fteValues = data.slice(1).map(row => row[fteIndex]).filter(value => value !== undefined && value !== null && value !== '');
//         const traineeValues = data.slice(1).map(row => row[traineeIndex]).filter(value => value !== undefined && value !== null && value !== '');

//         const uniqueAreaValues = [...new Set(areaValues)];


//         let dateTables = `
//         <div style="display: inline-grid;">
//             Data de início: <input type="date" style="margin: 15px" id="startDate" name="date" value="${new Date().toISOString().slice(0, 8)}01">
//             Data final: <input type="date" style="margin: 15px" id="endDate" name="date" value="${new Date().toISOString().slice(0,10)}">
//         </div>
//         `


//         Swal.fire({
//             title: "Qual o valor que deve ser feito o rateio?",
//             text: "Escreva qual deve ser o valor do rateio:",
//             input: 'number',
//             html: dateTables,
//             showCancelButton: true,
//         }).then(async (result) => {
//             if (result.value) {
//                 console.log(result.value)


//                 const sumResults = await uniqueAreaValues.map(uniqueAreaValue => {
//                     const fteSum = fteValues.reduce((acc, curr, index) => areaValues[index] === uniqueAreaValue ? acc + curr : acc, 0);
//                     const traineeSum = traineeValues.reduce((acc, curr, index) => areaValues[index] === uniqueAreaValue ? acc + curr : acc, 0);

//                     const totalSum = fteValues.reduce((acc, curr) => acc + curr, 0) + traineeValues.reduce((acc, curr) => acc + curr, 0);

//                     const results = (fteSum + traineeSum) / totalSum * result.value;
//                     return {
//                         area: uniqueAreaValue,
//                         fteSum,
//                         traineeSum,
//                         results,
//                     };
//                 });

//                 console.log(sumResults)

//                 const tableRows = sumResults.map(({ area, fteSum, traineeSum, results }) => `
//                     <td>${area}</td>
//                     <td>${fteSum + traineeSum}</td>
//                     <td>${results}</td>
//                 `);

//                 const tableHtml = `
//                     <div style='display: inline-grid; margin: 30px; min-width: 500px'>
//                         <i style='font-size: 49px; color: crimson; cursor: pointer' class='bx bx-x' onclick="this.parentElement.remove()"></i>

//                         <h4 style='font-weight: 900'>Tipo do Rateio: Pessoa</h4>
//                         <h4 style='font-weight: 900'>Valor do Rateio: ${result.value}</h4>

//                         <table style="border-collapse: collapse; width: auto;">
//                             <thead style="background-color: #ff0077; color: white;">
//                             <tr>
//                                 <th style="padding: 8px; text-align: center;">Area</th>
//                                 <th style="padding: 8px; text-align: center;">Head Count Total</th>
//                                 <th style="padding: 8px; text-align: center;">Rateio Total</th>
//                             </tr>
//                             </thead>
//                             <tbody>
//                             ${tableRows.map((row, index) => `<tr style="text-align:center ;background-color: ${index % 2 == 0 ? 'white' : '#f2f2f2'};">${row}</tr>`).join('')}
//                             </tbody>
//                         </table>
//                         <button style='background-color: #7EAB8E; color: white; margin-top: 30px; font-weight: 700' onclick="exportTableToExcel(this)"> Export as XLSX <i style='font-size: 49px' class='bx bx-file-export' ></i> </button>
//                     </div>
//                 `;
//                 const tablesDiv = document.getElementById('table-divs');

//                 tablesDiv.innerHTML += tableHtml;
//             }
//         });


//     } else {
//         console.log(`Sheet named "${sheetName}" not found.`);
//     }
// }

function readExcelFilePerson(sheetName){
	let sheetName = sheetName
    const file = dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
  
    if (!file) {
      console.log('No file selected.');
      return;
    }
  
    const workSheets = xlsx.parse(file[0]);
  
    const sheet = workSheets.find(sheet => sheet.name === sheetName);
  
    if (sheet) {
      const data = sheet.data;
  
      const nomeIndex = data[0].findIndex(cellValue => cellValue === 'Nome');
      const admissaoIndex = data[0].findIndex(cellValue => cellValue === 'Admissão');
      const codCcustoIndex = data[0].findIndex(cellValue => cellValue === 'Cód Ccusto');
      const descricaoCcustoIndex = data[0].findIndex(cellValue => cellValue === 'Descrição Ccusto');
      const situacaoIndex = data[0].findIndex(cellValue => cellValue === 'Situação');
      const dataDemissaoIndex = data[0].findIndex(cellValue => cellValue === 'Data Demissão');
      const tipoEmpregadoIndex = data[0].findIndex(cellValue => cellValue === 'Tipo Empregado');
  
      const startDate = new Date(document.getElementById('startDate').value);
      const endDate = new Date(document.getElementById('endDate').value);
  
      const filteredRows = data.slice(1).filter(row => {
        const situacao = row[situacaoIndex];
        const dataDemissao = new Date(row[dataDemissaoIndex]);
        const admissao = new Date(row[admissaoIndex]);
  
        if (
          (situacao !== 'Demitido' || dataDemissao <= startDate) &&
          (situacao !== 'Trabalhando' || admissao <= endDate)
        ) {
          return true;
        }
        return false;
      });
  
      const tableRows = filteredRows.map(row => `
        <td>${row[nomeIndex]}</td>
        <td>${row[admissaoIndex]}</td>
        <td>${row[codCcustoIndex]}</td>
        <td>${row[descricaoCcustoIndex]}</td>
        <td>${row[situacaoIndex]}</td>
        <td>${row[dataDemissaoIndex]}</td>
        <td>${row[tipoEmpregadoIndex]}</td>
      `);
  
      const tableHtml = `
        <div style='display: inline-grid; margin: 30px; min-width: 500px'>
          <i style='font-size: 49px; color: crimson; cursor: pointer' class='bx bx-x' onclick="this.parentElement.remove()"></i>
  
          <h4 style='font-weight: 900'>Tipo do Rateio: Pessoa</h4>
          <h4 style='font-weight: 900'>Valor do Rateio: ${result.value}</h4>
  
            <table style="border-collapse: collapse; width: auto;">
                <thead style="background-color: #ff0077; color: white;">
                    <tr>
                        <th style="padding: 8px; text-align: center;">Nome</th>
                        <th style="padding: 8px; text-align: center;">Admissão</th>
                        <th style="padding: 8px; text-align: center;">Cód Ccusto</th>
                        <th style="padding: 8px; text-align: center;">Descrição Ccusto</th>
                        <th style="padding: 8px; text-align: center;">Situação</th>
                        <th style="padding: 8px; text-align: center;">Data Demissão</th>
                        <th style="padding: 8px; text-align: center;">Tipo Empregado</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.map((row, index) => <tr style="text-align:center ;background-color: ${index % 2 == 0 ? 'white' : '#f2f2f2'};">${row}</tr>).join('')}
                </tbody>
            </table>
            <button style='background-color: #7EAB8E; color: white; margin-top: 30px; font-weight: 700' onclick="exportTableToExcel(this)"> Export as XLSX <i style='font-size: 49px' class='bx bx-file-export' ></i> </button>
            </div>
            `;
            const tablesDiv = document.getElementById('table-divs');
            tablesDiv.innerHTML += tableHtml;

            } else {
                console.log(`Sheet named "${sheetName}" not found.`);
            }
}
  

function exportTableToExcel(button) {
    let table = button.previousElementSibling;

    let rateioType = table.previousElementSibling.previousElementSibling.innerText.split(': ')[1];
    let rateioValue = table.previousElementSibling.innerText.split(': ')[1];

    let startDate = new Date(new Date(document.getElementById('startDate').value).getTime() + 86400000).toLocaleDateString('pt-BR');
    let endDate = new Date(new Date(document.getElementById('endDate').value).getTime() + 86400000).toLocaleDateString('pt-BR');


    let rows = Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.innerText));

    rows.unshift(['Valor do Rateio', rateioValue]);
    rows.unshift(['Tipo do Rateio', rateioType]);

    let buffer = xlsx.build([{name: 'Sheet1', data: rows}]);

    let filePath = dialog.showSaveDialogSync({
        title: 'Save as',
        defaultPath: 'rateio.xlsx',
        filters: [
            { name: 'Excel Files', extensions: ['xlsx'] },
            { name: 'All Files', extensions: ['*'] }
        ]
        });

    if(filePath){
        try {
            fs.writeFileSync(filePath, buffer);
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Arquivo criado com sucesso!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Erro na criação do arquivo: ' + error,
            });
        }
    }

}