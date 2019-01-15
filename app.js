// BUDGET CONTROLLER
var budgetContoller = (function() {
// // siin luuakse privat meetod, millele allpool saab 
//     // budgetcontroler.publicTest(7) //on 30// ligi. 
//     var x = 23;
    
//     var add = function(a) {
//         return x + a;
//         // x ja add on kättesaadavad ainult publicTest meetodile
//     }
    
//     return {
//         //siit tuleb meetod
//         publicTest: function(b) {
//             //console.log(add(b)); // kui see oli returni asemel, siis controller iga public argumendiga kohe consoleligis 
//             return add(b);
//         }
//     }
// })(); // need sulud anonymus funktsiooni taga tähendavad, et JS runtime loeb selle sisse alguses.
// // deklareeritakse ülemine funktsioon ja returnitakse see alumine publicTest object, 
// // milles siis on meetod (neid võib olla palju)
    var Expense = function(id, decription, value) { // suure täheg var on construktor
        this.id = id;
        this.description = decription;
        this.value = value; // siia saab anna ka meetodid, mis pärandatakse kõigile 
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, decription, value) { // suure täheg var on construktor
        this.id = id;
        this.description = decription;
        this.value = value;
    };
    
    //arvutame publik meetodi jaoks summa
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };
    // väärtuste hoidmiseks võiks kasutada arraysid:
    //var allExpenses =[];
    //var allIncome = [];
    //var totalExpenses = 0;
    // aga me teeme teistmoodi datastruktuuri
    
    //teeme kõik ühte kohta
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1  // kui väärtust ei ole, siis ei saa ka 0 olla ja siis märgitakse tavaliselt -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
           // ID = 0;
            // teeme uue ID, mis peab olema unikaalne, alati võtame viimase arrayst
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id +1;
            } else {
                ID = 0;
            }
            
            // teeme uue Itemi sõltuvalt, kas on exp või inp
            if(type === "exp"){
                newItem = new Expense(ID, des, val);
            }else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }
            
            // Push lükkab selle info array viimasele kohale
            data.allItems[type].push(newItem);
            
            return newItem;
                        
        },
        
        //Publik meetodid kogu programmist juurdepääsetavad
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // id = 3
            // näide, kuidas ei tööta:
             // data.allItems[type][id];
            // see kustutaks arreyst 4. liikme, mitte selle, mille id = 3.
            
            // Siin mapime arrey uuesti ja anname uue järjekorranumbri ja siis allpool kustutame just selle, millele nupule vajutades osutati.
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1); // splice meetod kustutab 
            }
        },
        
        calculatePercentages: function() {
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        calculateBudget: function() {
            //tummeerime algul kogu sisse/väljamineku
            //kuna see funktsioon on privat, siis teeme seda üleval privat tsoonis
            calculateTotal("exp");
            calculateTotal("inc");
            
            //eearve = sissetulek - väljaminek
            data.budget = data.totals.inc - data.totals.exp;
            
            //arvuta milline protsent eelarvest oli kulu
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) *100);
                } else {
                data.percentage = -1;
            } 
        },
        
        getBudget: function() {
          //siin me returnime 4 väärtus ja kõige parem selle tegemiseks on teha objekt
            return   {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();


    // UI CONTROLLER
var UIController = (function() {
    // some code
    //DOM suhtlus UI inputi ja HTMLiga
    
    var DOMstrings = { // nüüd korjasime hardcoded HTMLi koodist välja DOMstringiks
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }; // kui klassinimed on HTMList ühte kokku kogutud, siis on siin hea lihtne ühest kohast muuta, kui frontend peaks muutuma.
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    // public inf
    return{
        getinput: function() {
            return { //funktsiooni väärtuste asemel returnime hoopis objekti propertitga
                type: document.querySelector(DOMstrings.inputType).value,   // incam või expensis
                description:  document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
            
           // var type = document.querySelector(".add__type").value;   // incam või expensis
            //var description = document.querySelector(".add__description").value;
            //var value = document.querySelector(".add_value").value;
        },
        // nüüd teeme selle publicuks, et ka teised kontrollerid saaks ühest kohast HTMLi muutmise korral setinguid muuta
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // replace the placeholder text with some actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert iht HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
            
        },
        
        deleteListItem: function(selectotID) {
            
            var el = document.getElementById(selectotID);
            el.parentNode.removeChild(el);
        },
        
        //puhastame sisestusväljad peale kasutamist:
        clearFields: function() {
          var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);  
            // siin on väike probleem - inputDescription on list, mitte array.
            // array meetod fields.slice() siin otse ei tööta.
            // siin kõikide Arrayde ema prototüübi poole ja söödame talle selle listi nii ette ja siis teeme sellest var-i.
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            //nüüd käime forEach funktsiooniga kõik läbi:
            fieldsArr.forEach(function(current, index, array){
                current.value = '';
            });
            
            fieldsArr[0].focus(); //see siin viib kursori tagasi sisestusvälja algusesse
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
         displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni', 'Juuli', 'August', 'September', 'Oktober', 'November', 'Detsember'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
        
    };
    
}) ();

    // GLOBAL APP CONROLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        // loome ühe koha, kus kõik eventid on koos ja tõstame kõik selle alla:
            var DOM = UICtrl.getDOMstrings(); // selleks, et saaks ligi
            //  //some code
            //  var z = budgetCtrl.publicTest(10)
            //  return {
            //      anotherPublic: function() {
            //          console.log(z);
            //      }
            //  }
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); // kui vajutatakse nuppu, siis pöördub fu, poole
        
                                                                 //function() {
              // console.log("nupule vajutati"); 


               // anonüümset funk pole vaja, sest nupp ja enter lähevad ühe alamfunktsiooni alla  
           // });
        
            document.addEventListener("keypress", function(event) { //event objectkuulab igat klahvi
                //console.log(event);
                if (event.keyCode === 13 || event.which === 13) {
                    //console.log("ENTER");
                    ctrlAddItem(); //kui pressitakse Enter, siis pöördub funktsiooni poole
                }
        
            });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    
    };
    
    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        //console.log(budget);
    };
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        //console.log(percentages);
    };

    
    // esmalt oli nupu ja Enterklahvi kuulamine eraldi aga nad mõlemad oleks teinud sama asja, seega tehti eraldi     
    var ctrlAddItem = function() {
        var input, newItem;
        //console.log("töötab");
        // 1. get the field input data
        
        input = UICtrl.getinput();
       // console.log(input);
        
        
        if (input.description !="" && !isNaN(input.value) && input.value > 0) {
                // 2.  add the item to the budget controllet
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);


                // 3. add the item to the UI

                UICtrl.addListItem(newItem, input.type);

                // 4. puhastame väljad peale sisestust:
                UICtrl.clearFields();

                // 5. uus pöördumine Budgeti funktsiooni poole
                updateBudget();
            
                // 6. Calculate and update percentages
                updatePercentages();

            }
        
        
        // 5. calculate teh budget //Budgeti kohta tuli eraldi funktsioon
        
        // 6. display the budget on the UI
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        //console.log(event.target.parentNode); // .parentNode annab ikooni taga oleva nupu väärtuse kätte
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // hardcoded DOM element ;)
        if(itemID) {
             //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();
            
        }
    };
    
    
    return{
        init: function() {
            console.log("aplication satarted.");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetContoller, UIController);

controller.init();