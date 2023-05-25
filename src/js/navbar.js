
function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                
                return allText
                //alert(allText);
            }
        }
    }
    rawFile.send(null);
    return rawFile.response
    
}

function changeFile(){
    const Swal = require('sweetalert2')
    const fs = require('fs');

    Swal.fire({
        title: 'Selecione o Tipo de Arquivo',
        showCancelButton: true,
        confirmButtonText: `Local`,
        denyButtonText: `Online`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const {dialog, getCurrentWindow, globalShortcut,BrowserWindow} = require('electron').remote;
                
                let outputPath = "./UltimaPlanilha/ultima_planilha.txt"

                fs.mkdir("./UltimaPlanilha", { recursive: true }, (err) => {
                    if (err) throw err;
                    console.log("Creating Dir");
                  });

                let file = dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }).then((result)=>{
                    fs.writeFileSync(outputPath, result.filePaths[0], {encoding:'utf8',flag:'w'}, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                    });  
                }).then(()=>{
                    var text = fs.readFileSync('./UltimaPlanilha/ultima_planilha.txt','utf8')
                    $('#actualFile').empty()
                    $('#actualFile').append(text);
                    console.log(text);
                    window.location.reload();
                })

            }
            else if (result.isDenied) {
                Swal.fire({
                    title: "Adicione o URL",
                    input: 'text',
                    showCancelButton: true        
                }).then((result) => {
                    if (result.value) {
                        console.log(result)
                    }
                });
            }
        })
    
}



function loadSidebar() {
    var $ = jQuery = require("jquery")
    var navbar_code_str = `
    <link rel="stylesheet" href="../css/navbarstyle.css">
    <div class="sidebar open">
    <div class="companyLogo">
        <i class='bx bx-copyright icon'></i>
        <div class="logo_name">LETSMarketing</div>
    </div>
    <ul class="optionsNavigator">
        <li>
        <a href="../dashboard/index.html">
            <i class='bx bx-chart'></i>
            <span class="spanLinks">Dashboard</span>
        </a>
        <span class="hoverText">Dashboard</span>
        </li>
        <li>
        <a href="../incluir-dado/index.html">
        <i class='bx bx-book-add' ></i>
        <span class="spanLinks">Incluir Dados</span>
        </a>
        <span class="hoverText">Incluir Dados</span>
    </li>
    <li>
        <a href="../editar-dado/index.html">
        <i class='bx bx-edit' ></i>
        <span class="spanLinks">Editar um Dado</span>
        </a>
        <span class="hoverText">Editar um Dado</span>
    </li>
    <li>
        <a href="../consulta-mes/index.html">
        <i class='bx bx-calendar'></i>
        <span class="spanLinks">Consulta por Mês</span>
        </a>
        <span class="hoverText">Consulta por Mês</span>
    </li>
    <li>
        <a href="../consulta-escritorio/index.html">
        <i class='bx bx-briefcase' ></i>
        <span class="spanLinks">Consulta por Escritórios</span>
        </a>
        <span class="hoverText">Consulta por Escritórios</span>
    </li>
    <li>
        <a href="../consulta-instituicoes/index.html">
        <i class='bx bx-copyright' ></i>
        <span class="spanLinks">Consulta por Instituições</span>
        </a>
        <span class="hoverText">Consulta por Instituições</span>
    </li>
    <li>
        <a href="../consulta-responsaveis/index.html">
        <i class='bx bx-user' ></i>
        <span class="spanLinks">Consulta por Responsáveis</span>
        </a>
        <span class="hoverText">Consulta por Responsáveis</span>
    </li>
    <li>
        <a href="../consulta-complexa/index.html">
        <i class='bx bx-search-alt-2' ></i>
        <span class="spanLinks">Consulta Complexa</span>
        </a>
        <span class="hoverText">Consulta Complexa</span>
    </li>
    <li class="profile">
        <a href="#" onclick="changeFile()">
        <i class='bx bx-sync' ></i>
        <span class="spanLinks">Carregar Novo Arquivo</span>
        </a>
        <div class="divActual">
        <span class="actual" id="actualFile">Atual: </span>
        </div>
        <script>
        const fs = require('fs');
        var text = fs.readFileSync('./UltimaPlanilha/ultima_planilha.txt','utf8')
        $('#actualFile').append(text);
        console.log(text);
        
        </script>
        <span class="hoverText">Carregar Novo Arquivo</span>
    </li>
    </ul>
    </div>
    <script src="navbarscript.js"></script>
    `;
    $('body').append(navbar_code_str);
    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");

    // closeBtn.addEventListener("click", ()=>{
    // sidebar.classList.toggle("open");
    // });

}