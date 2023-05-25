const xlsx = require('node-xlsx').default;
//const ExcelJS = require('exceljs');


const remote = require('@electron/remote');
const { dialog } = remote;
const Swal = require('sweetalert2')
const fs = require('fs');
const { format } = require('path');

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


function readExcelFileFlat(sheetName) {
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

    // Get column indices
    const nomeIndex = data[0].indexOf('Nome');
    const admissaoIndex = data[0].indexOf('Admissão');
    const codCcustoIndex = data[0].indexOf('Cód Ccusto');
    const descricaoCcustoIndex = data[0].indexOf('Descrição Ccusto');
    const situacaoIndex = data[0].indexOf('Situação');
    const dataDemissaoIndex = data[0].indexOf('Data Demissão');
    const tipoEmpregadoIndex = data[0].indexOf('Tipo Empregado');

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // getMonth() returns 0-indexed month
    const lastDay = new Date(year, month, 0).getDate();

    const defaultDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    let dateTables = `
      <div style="display: inline-grid;">
        Data de início: <input type="date" style="margin: 15px" id="startDate" name="date" value="${new Date().toISOString().slice(0, 8)}01">
        Data final: <input type="date" style="margin: 15px" id="endDate" name="date" value="${defaultDate}">
      </div>
    `;

    Swal.fire({
      title: "Qual o valor que deve ser feito o rateio?",
      text: "Escreva qual deve ser o valor do rateio:",
      input: 'number',
      html: dateTables,
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value && !isNaN(Date.parse(document.getElementById('startDate').value)) && !isNaN(Date.parse(document.getElementById('endDate').value))) {
        const startDate = document.getElementById('startDate').value;

        // Format the startDate as dd/mm/yyyy
        const startDateParts = startDate.split('-');
        const formattedStartDate = `${startDateParts[2]}/${startDateParts[1]}/${startDateParts[0]}`;


        const endDate = document.getElementById('endDate').value;

        // Format the startDate as dd/mm/yyyy
        const endDateParts = endDate.split('-');
        const formattedEndDate = `${endDateParts[2]}/${endDateParts[1]}/${endDateParts[0]}`;

        console.log(formattedStartDate, formattedEndDate);

        function isAfter(firstDate, secondDate){
          const [day1, month1, year1] = firstDate.split('/');
          const [day2, month2, year2] = secondDate.split('/');

          const date1 = new Date(year1, month1-1, day1);
          const date2 = new Date(year2, month2-1, day2);

          console.log(date1, " < ",date2);
          console.log(date1<date2)

          return date1 < date2;
        }

        // // Filter and process the data
        const filteredData = data.slice(1).filter((row) => {
          let situacao = row[situacaoIndex];
          let dataDemissao = row[dataDemissaoIndex];
          let admissao = row[admissaoIndex];

          if (
            (situacao === 'Trabalhando' && isAfter(admissao, formattedStartDate)) ||
            (situacao === 'Demitido' && isAfter(formattedStartDate, dataDemissao))
          ) {
            console.log(row)
            return true;
          } else {
            return false;
          }
        });
          
        console.log(filteredData)
          

        // Count rows for each unique value in Cód Ccusto column
        const codCcustoCounts = {};
        for (const row of filteredData) {
          const codCcusto = row[codCcustoIndex];
          if (codCcusto) {
            codCcustoCounts[codCcusto] = (codCcustoCounts[codCcusto] || 0) + 1;
          }
        }

        console.log('Cód Ccusto Counts:', codCcustoCounts);

        // Divide result.value by the total count for each Cód Ccusto
        const dividedResults = {};
        for (const codCcusto in codCcustoCounts) {
          if (codCcustoCounts.hasOwnProperty(codCcusto)) {
            dividedResults[codCcusto] = result.value / Object.keys(codCcustoCounts).length;
          }
        }
        

        const tableRows = Object.entries(codCcustoCounts).map(([codCcusto, count]) => {
          const descricaoCcusto = data.find(row => row[codCcustoIndex] === codCcusto)[descricaoCcustoIndex];
          const dividedValue = dividedResults[codCcusto];

          return `
            <tr>
              <td>${codCcusto}</td>
              <td>${descricaoCcusto}</td>
              <td>${count}</td>
              <td>${dividedValue.toFixed(2)}</td>
            </tr>
          `;
        });

        const tableHtml = `
          <div style='display: inline-grid; margin: 30px; min-width: 500px'>
            <i style='font-size: 49px; color: crimson; cursor: pointer' class='bx bx-x' onclick="this.parentElement.remove()"></i>

            <h4 style='font-weight: 900'>Tipo do Rateio: Flat</h4>
            <h4 style='font-weight: 900'>Valor do Rateio: ${result.value}</h4>
            <h4 style='font-weight: 900'>Data de ínicio: ${formattedStartDate}</h4>
            <h4 style='font-weight: 900'>Data final: ${formattedEndDate}</h4>

            <table style="border-collapse: collapse; width: auto;">
              <thead style="background-color: #ff0077; color: white;">
                <tr>
                  <th style="padding: 8px; text-align: center;">Cód Ccusto</th>
                  <th style="padding: 8px; text-align: center;">Descrição Ccusto</th>
                  <th style="padding: 8px; text-align: center;">Head Count</th>
                  <th style="padding: 8px; text-align: center;">Rateio</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows.join('')}
              </tbody>
            </table>
            <button style='background-color: #7EAB8E; color: white; margin-top: 30px; font-weight: 700' onclick="exportTableToExcel(this)"> Export as XLSX <i style='font-size: 49px' class='bx bx-file-export' ></i> </button>
          </div>
        `;

        const tablesDiv = document.getElementById('table-divs');
        tablesDiv.innerHTML += tableHtml;
      }
      else{
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Algo deu errado! Verifique o todos os valores inseridos são válidos e tente novamente.',
          footer: '<a href="../contacts/index.html">Precisa de ajuda?</a>'
        });
      }
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Arquivo não encontrado! Verifique se o arquivo está na pasta correta e tente novamente.',
      footer: '<a href="../contacts/index.html">Precisa de ajuda?</a>'
    });
    console.log(`Sheet named "${sheetName}" not found.`);
  }
}



function readExcelFilePerson(sheetName) {
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

    // Get column indices
    const nomeIndex = data[0].indexOf('Nome');
    const admissaoIndex = data[0].indexOf('Admissão');
    const codCcustoIndex = data[0].indexOf('Cód Ccusto');
    const descricaoCcustoIndex = data[0].indexOf('Descrição Ccusto');
    const situacaoIndex = data[0].indexOf('Situação');
    const dataDemissaoIndex = data[0].indexOf('Data Demissão');
    const tipoEmpregadoIndex = data[0].indexOf('Tipo Empregado');

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // getMonth() returns 0-indexed month
    const lastDay = new Date(year, month, 0).getDate();

    const defaultDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    let dateTables = `
      <div style="display: inline-grid;">
        Data de início: <input type="date" style="margin: 15px" id="startDate" name="date" value="${new Date().toISOString().slice(0, 8)}01">
        Data final: <input type="date" style="margin: 15px" id="endDate" name="date" value="${defaultDate}">
      </div>
    `;

    Swal.fire({
      title: "Qual o valor que deve ser feito o rateio?",
      text: "Escreva qual deve ser o valor do rateio:",
      input: 'number',
      html: dateTables,
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value && !isNaN(Date.parse(document.getElementById('startDate').value)) && !isNaN(Date.parse(document.getElementById('endDate').value))) {
        const startDate = document.getElementById('startDate').value;

        // Format the startDate as dd/mm/yyyy
        const startDateParts = startDate.split('-');
        const formattedStartDate = `${startDateParts[2]}/${startDateParts[1]}/${startDateParts[0]}`;


        const endDate = document.getElementById('endDate').value;

        // Format the startDate as dd/mm/yyyy
        const endDateParts = endDate.split('-');
        const formattedEndDate = `${endDateParts[2]}/${endDateParts[1]}/${endDateParts[0]}`;

        console.log(formattedStartDate, formattedEndDate);

        function isAfter(firstDate, secondDate){
          const [day1, month1, year1] = firstDate.split('/');
          const [day2, month2, year2] = secondDate.split('/');

          const date1 = new Date(year1, month1-1, day1);
          const date2 = new Date(year2, month2-1, day2);

          console.log(date1, " < ",date2);
          console.log(date1<date2)

          return date1 < date2;
        }

        // // Filter and process the data
        const filteredData = data.slice(1).filter((row) => {
          let situacao = row[situacaoIndex];
          let dataDemissao = row[dataDemissaoIndex];
          let admissao = row[admissaoIndex];

          if (
            (situacao === 'Trabalhando' && isAfter(admissao, formattedStartDate)) ||
            (situacao === 'Demitido' && isAfter(formattedStartDate, dataDemissao))
          ) {
            console.log(row)
            return true;
          } else {
            return false;
          }
        });
          
        console.log(filteredData)
          

        // Count rows for each unique value in Cód Ccusto column
        const codCcustoCounts = {};
        for (const row of filteredData) {
          const codCcusto = row[codCcustoIndex];
          if (codCcusto) {
            codCcustoCounts[codCcusto] = (codCcustoCounts[codCcusto] || 0) + 1;
          }
        }

        console.log('Cód Ccusto Counts:', codCcustoCounts);

        const totalCount = Object.values(codCcustoCounts).reduce((acc, count) => acc + count, 0);

        // Divide result.value by the total count for each Cód Ccusto
        const dividedResults = {};
        for (const codCcusto in codCcustoCounts) {
          if (codCcustoCounts.hasOwnProperty(codCcusto)) {
            dividedResults[codCcusto] = result.value / totalCount * codCcustoCounts[codCcusto];
          }
        }

        const tableRows = Object.entries(codCcustoCounts).map(([codCcusto, count]) => {
          const descricaoCcusto = data.find(row => row[codCcustoIndex] === codCcusto)[descricaoCcustoIndex];
          const dividedValue = dividedResults[codCcusto];

          return `
            <tr>
              <td>${codCcusto}</td>
              <td>${descricaoCcusto}</td>
              <td>${count}</td>
              <td>${dividedValue.toFixed(2)}</td>
            </tr>
          `;
        });

        const tableHtml = `
          <div style='display: inline-grid; margin: 30px; min-width: 500px'>
            <i style='font-size: 49px; color: crimson; cursor: pointer' class='bx bx-x' onclick="this.parentElement.remove()"></i>

            <h4 style='font-weight: 900'>Tipo do Rateio: Pessoa</h4>
            <h4 style='font-weight: 900'>Valor do Rateio: ${result.value}</h4>
            <h4 style='font-weight: 900'>Data de ínicio: ${formattedStartDate}</h4>
            <h4 style='font-weight: 900'>Data final: ${formattedEndDate}</h4>

            <table style="border-collapse: collapse; width: auto;">
              <thead style="background-color: #ff0077; color: white;">
                <tr>
                  <th style="padding: 8px; text-align: center;">Cód Ccusto</th>
                  <th style="padding: 8px; text-align: center;">Descrição Ccusto</th>
                  <th style="padding: 8px; text-align: center;">Head Count</th>
                  <th style="padding: 8px; text-align: center;">Rateio</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows.join('')}
              </tbody>
            </table>
            <button style='background-color: #7EAB8E; color: white; margin-top: 30px; font-weight: 700' onclick="exportTableToExcel(this)"> Export as XLSX <i style='font-size: 49px' class='bx bx-file-export' ></i> </button>
          </div>
        `;

        const tablesDiv = document.getElementById('table-divs');
        tablesDiv.innerHTML += tableHtml;
      }
      else{
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Algo deu errado! Verifique o todos os valores inseridos são válidos e tente novamente.',
          footer: '<a href="../contacts/index.html">Precisa de ajuda?</a>'
        });
      }
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Algo deu errado! Verifique o todos os valores inseridos são válidos e tente novamente.',
      footer: '<a href="../contacts/index.html">Precisa de ajuda?</a>'
    });
    console.log(`Sheet named "${sheetName}" not found.`);
  }
}





function exportTableToExcel(button) {
    let table = button.previousElementSibling;

    let rateioType = table.previousElementSibling.previousElementSibling.innerText.split(': ')[1];
    let rateioValue = table.previousElementSibling.innerText.split(': ')[1];
    let anotherTable = table.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.innerText.split(': ')[1];

    let rows = Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.innerText));

    rows.unshift(['Tipo do Rateio', anotherTable]);
    rows.unshift(['Fim do Rateio', rateioValue]);
    rows.unshift(['Início do Rateio', rateioType]);

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