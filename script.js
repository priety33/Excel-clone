const $ = require("jquery");
const fs = require("fs");
var app = require('electron').remote; 
var dialog = app.dialog;

class stack {
    constructor() {
            this.items= [];
        }
    push(el) {
            this.items.push(el);
        }
    pop() {
            if(this.items.length == 0) return;
            return this.items.pop();
        }
    top() {
            return this.items[this.items.length - 1];
        }
    empty() {
            return this.items.length == 0;
        }
}

$(document).ready(
    function () {
        let db;
        let lsc;
        // ***************Formatting and functionality
        $(".menu >*").on("click", function () {
            let id = $(this).attr("id");
            $(".menu-options-item").removeClass("selected");
            $(`#${id}-menu-options`).addClass("selected");
        })

        $("#grid .cell").on("click", function () {
            let ri = Number($(this).attr("ri"));
            let ci = Number($(this).attr("ci"));
            let Address = String.fromCharCode(65 + ci) + (ri + 1); // A1, B2 etc.
            let cellObject = getCellObject(ri, ci);
            $("#address-input").val(Address); // address of selected shown on selecting it, in address input box
            $("#formula-input").val(cellObject.formula);
            $(this).addClass("selected");
                        if (lsc && lsc != this)
                $(lsc).removeClass("selected");
            lsc = this;
            if (cellObject.bold) {
                $('#bold').addClass('selected');
            } else {
                $('#bold').removeClass('selected');
            }

            if (cellObject.underline) {
                $('#underline').addClass('selected');
            } else {
                $('#underline').removeClass('selected');
            }

            if (cellObject.italic) {
                $('#italic').addClass('selected');
            } else {
                $('#italic').removeClass('selected');
            }
        })


        $('#font-family').on("change", function () {
            let fontFamily = $(this).val();

            let cell = $("#grid .cell.selected")
            $(cell).css("font-family", fontFamily);

            let rid = parseInt($(cell).attr('ri'));
            let cid = parseInt($(cell).attr('ci'));

            db[rid][cid].fontFamily = fontFamily;
        })
    

$('#font-size').on("change", function () {
    let fontSize = $(this).val();

    let cell = $("#grid .cell.selected");

    $(cell).css("font-size", fontSize + 'px');

    let rid = parseInt($(cell).attr('ri'));
    let cid = parseInt($(cell).attr('ci'));

    db[rid][cid].fontSize = fontSize;

})
$('#bold').on("click", function () {
    $(this).toggleClass('selected');
    let bold = $(this).hasClass('selected');
    let cell = $("#grid .cell.selected")
    $(cell).css("font-weight", bold ? "bolder" : "normal");

    let rid = parseInt($(cell).attr('ri'));
    let cid = parseInt($(cell).attr('ci'));

    db[rid][cid].bold = bold;
})

$('#underline').on("click", function () {
    $(this).toggleClass('selected');
    let underline = $(this).hasClass('selected');

    let cell = $("#grid .cell.selected")
    $(cell).css("text-decoration", underline ? "underline" : "none");

    let rid = parseInt($(cell).attr('ri'));
    let cid = parseInt($(cell).attr('ci'));

    db[rid][cid].underline = underline;

})

$('#italic').on("click", function () {
    $(this).toggleClass('selected');
    let italic = $(this).hasClass('selected');

    let cell = $("#grid .cell.selected")
    $(cell).css("font-style", italic ? "italic" : "normal");

    let rid = parseInt($(cell).attr('ri'));
    let cid = parseInt($(cell).attr('ci'));

    db[rid][cid].italic = italic;
})

 $('[halign]').on('click', function () {
     $('[halign]').removeClass('selected');
     $(this).addClass('selected');

     let halign = $(this).attr('halign');

     $("#grid .cell.selected").each(function () {
         $(this).css("text-align", halign);

         let rid = parseInt($(this).attr('ri'));
         let cid = parseInt($(this).attr('ci'));

         db[rid][cid].halign = halign;
         $(this).trigger('keyup');
     })
 })
// **************************New Open Save*********************

$("#New").on("click", function () {
    db = [];
    let rows = $("#grid").find(".row");
    for (let i = 0; i < rows.length; i++) {
        let cells = $(rows[i]).find(".cell");
        let row = [];
        for (let j = 0; j < cells.length; j++)
         {

            let cell = {
                value: "",
                formula: "",
                downstream: [],
                upstream: [],
                fontFamily: 'Arial',
                fontSize: 12,
                bold: false,
                underline: false,
                italic: false,
                bgColor: '#FFFFFF',
                textColor: '#000000',
                halign: 'left'
            }
            $(cells[j]).html("");
            $(cells[j]).html(cell.value);
            $(cells[j]).css('font-family', cell.fontFamily);
            $(cells[j]).css("font-size", cell.fontSize + 'px');
            $(cells[j]).css("font-weight", cell.bold ? "bolder" : "normal");
            $(cells[j]).css("text-decoration", cell.underline ? "underline" : "none");
            $(cells[j]).css("font-style", cell.italic ? "italic" : "normal");
            $(cells[j]).css("text-align", cell.halign);
            row.push(cell);
        }
        db.push(row);
    }
    console.log(db);
    //initially A1 selected
    $($("#grid .cell")[0]).trigger("click");
})
$("#Save").on("click", async function () {
    
    let jsonData = JSON.stringify(db);
    /*console.log(sdb.filePaths[0]);
    fs.writeFileSync(sdb.filePaths[0], jsonData);
    console.log("File Saved")*/
    dialog.showSaveDialog((fileName) => {
        if (fileName === undefined){
            console.log("You didn't save the file");
            return;
        }

        fs.writeFile(fileName, jsonData, (err) => {
            if(err){
                alert("An error ocurred creating the file "+ err.message)
            }
            alert("The file has been succesfully saved");
        });
    }); 
})
$("#Open").on("click", async function () {
    let sdb = await dialog.showOpenDialog();
    let buffContent = fs.readFileSync(sdb.filePaths[0]);
    db = JSON.parse(buffContent);

    let rows = $("#grid").find(".row");
    for (let i = 0; i < rows.length; i++) {
        let cells = $(rows[i]).find(".cell");

        for (let j = 0; j < cells.length; j++) {
            let cell = db[i][j]
            $(cells[j]).html("");
            $(cells[j]).html(cell.value);
            $(cells[j]).css('font-family', cell.fontFamily);
            $(cells[j]).css("font-size", cell.fontSize + 'px');
            $(cells[j]).css("font-weight", cell.bold ? "bolder" : "normal");
            $(cells[j]).css("text-decoration", cell.underline ? "underline" : "none");
            $(cells[j]).css("font-style", cell.italic ? "italic" : "normal");
            $(cells[j]).css("background-color", cell.bgColor);
            $(cells[j]).css("color", cell.textColor);
            $(cells[j]).css("text-align", cell.halign);
        }
    }
    console.log("File Opened");
})

// *************************Formula*******************************
// => when you enter anything who should put an entry inside db 
$("#grid .cell").on("blur", function () {
    let ri = Number($(this).attr("ri"));
    let ci = Number($(this).attr("ci"));
    let cellObject = getCellObject(ri, ci);
    
    //here we didnt check if value remained same or not because if val previously = 50 using formula, and we again put it to 50 manually,
    //then also formula needs to be removed.

    //value of cell changed => remove previous formula
    if (cellObject.formula) {
        removeFormula(cellObject, ri, ci);
    }
    updateCell(ri, ci, $(this).html())
})

$("#formula-input").on("blur", function () {
    let cellAddress = $("#address-input").val();
    let { rowId, colId } = getrowcol(cellAddress);
    let cellObject = getCellObject(rowId, colId);
    // set formula property
    // if formula creates cycle, dont update formula and return
    if( !isFormulaValid(cellObject, $(this).val()) ) {
        dialog.showErrorBox("Error", "Cycle exists");
        return;
    }

    if (cellObject.formula == $(this).val()) { // current formula == value in val attribute of input box => no change occured in formula => cell was only clicked => dont call any evaluate fnc etc.
        return;
    }

    if (cellObject.formula) { //cell already has formula => remove old formula
        removeFormula(cellObject, rowId, colId)
    }
    // writing on UI, earlier it was only written on html
    cellObject.formula = $(this).val();
    // evaluate formula
    let rVal = evaluate(cellObject); // converting A1+A2 to 10+20

    setupFormula(rowId, colId, cellObject.formula); // updating downstream and upstream
    updateCell(rowId, colId, rVal); //updating current cell, and all children cell if my value is changed
})

function evaluate(cellObject) {
    // ( A1 + A2 )
    let formula = cellObject.formula;
    console.log(formula);
    let formulaComponent = formula.split(" ");
    // ["(","A1",+,"A2",")"]
    for (let i = 0; i < formulaComponent.length; i++) {
        let code = formulaComponent[i].charCodeAt(0);
        // if cell
        if (code >= 65 && code <= 90) {
            let parent = getrowcol(formulaComponent[i]);
            let parentObj = db[parent.rowId][parent.colId];
            let value = parentObj.value;
            formula = formula.replace(formulaComponent[i], value); // replace A1 with 10 (its val)
        }
    }
    // (10 + 20 ) 
    console.log(formula);
    // infix evaluation
    let rVal = infix(formula);
    console.log(rVal);
    return rVal;

}
function updateCell(rowId, colId, rVal) {
    let cellObject = getCellObject(rowId, colId);
    cellObject.value = rVal;
    $(`#grid .cell[ri=${rowId}][ci=${colId}]`).html(rVal); // updating value on UI

    for (let i = 0; i < cellObject.downstream.length; i++) {
        let child = cellObject.downstream[i];
        let c = getCellObject(child.rowId, child.colId);
        let rVal = evaluate(c);
        updateCell(child.rowId, child.colId, rVal)
    }
}

function setupFormula(rowId, colId, formula) {
    // ( A1 + A2 )
    let cellObject = getCellObject(rowId, colId);
    let formulaComponent = formula.split(" ");
    // [(,A1,+,A2,)]
    for (let i = 0; i < formulaComponent.length; i++) {
        let code = formulaComponent[i].charCodeAt(0);
        // if cell
        if (code >= 65 && code <= 90) {
            let parent = getrowcol(formulaComponent[i]);
            let parentObj = db[parent.rowId][parent.colId];

            parentObj.downstream.push({
                rowId: rowId, colId: colId
            })
            cellObject.upstream.push({
                rowId: parent.rowId,
                colId: parent.colId
            })
        }
    }
}

function removeFormula(cellObject, rowId, colId) {
    // delete yourself from parent's downstream
    for (let i = 0; i < cellObject.upstream.length; i++) {
        let par = cellObject.upstream[i];
        let p = getCellObject(par.rowId, par.colId);
        let fupArr = [];
        for (let j = 0; j < p.downstream.length; j++) {
            let rc = p.downstream[j];
            if (!(rc.rowId == rowId && rc.colId == colId)) {
                fupArr.push(rc);
            }
        }
        p.downstream = fupArr;
    }
    // remove formula
    cellObject.formula = "";
    // clear upstream
    cellObject.upstream = [];

}
function getCellObject(rowId, colId) {
    return db[rowId][colId];
}
function getrowcol(cellAddress) {
    let colId = cellAddress.charCodeAt(0) - 65;

    let row = cellAddress.substring(1);
    let rowId = Number(row) - 1;
    return { rowId, colId };
}

function precedence(operator){
        switch(operator){
        case "^": return 3;
        case "*": return 2;
        case "/": return 2;
        case "+": return 1;
        case "-": return 1;
        default: return 0;
        }
}

function calculate(a, b, op){ 
    switch(op){ 
        case '+': return Number(a)+Number(b); 
        case '-': return a-b; 
        case '*': return a*b; 
        case '/': return a/b; 
        case '^': return Math.pow(a, b); 
    } 
} 

function infix(formula) {

    let token= formula.split(" ");

    let exp= new stack();
    let opr= new stack();

    for(let i=0; i<token.length; i++) {
        if(token[i]==="(") opr.push(token[i]);
        else if(token[i]===")") {
            while(!opr.empty() && opr.top()!=="(") {
                let b= exp.pop();
                let a= exp.pop();
                let op= opr.pop();
                exp.push(calculate(a, b, op))
            }
            opr.pop();
        }
        else if(token[i]==="+" || token[i]==="-" || token[i]==="*" || token[i]==="/" || token[i]==="^") {
            while(!opr.empty() && precedence(opr.top())>=precedence(token[i])) {
                let b= exp.pop();
                let a= exp.pop();
                let op= opr.pop();
                exp.push(calculate(a, b, op))
            }
            opr.push(token[i]);
        }
        else exp.push(token[i]);
    }

    while(!opr.empty()) {
        let b= exp.pop();
        let a= exp.pop();
        let op= opr.pop();
        exp.push(calculate(a, b, op))
    }

    return exp.top();
}

function insertparent(cellObject, visited) {
    if(visited.has(cellObject)) return;
    visited.add(cellObject);

    for (let i = 0; i < cellObject.upstream.length; i++) {
        let child = cellObject.upstream[i];
        let p = getCellObject(child.rowId, child.colId);
        insertparent(p, visited);
    }
}

function isFormulaValid( cellObject, formula) {
    let token= formula.split(" ");
    let visited= new Set();
    for (let i = 0; i < token.length; i++) {
        let code = token[i].charCodeAt(0);
        if (code >= 65 && code <= 90) {
            let par = getrowcol(token[i]);
            let p = getCellObject(par.rowId, par.colId);
            insertparent(p, visited);
        }
    }
    if(visited.has(cellObject)) return false;
    return true;
}

function init() {
    $("#File").trigger("click");
    $("#New").trigger("click");
}
init()
   }

)