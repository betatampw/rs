var fs = require('fs');
var csv = require('csv');

var tableData;
var lines;

csv().from('table_test2.csv', { // получаем матрицу рейтингов
  delimiter: ';'
}).to.array(function(data) {
  //console.log(data)
  itemBasedAC(0, 0, data); // USER BASED


  /* 
 csv().from('tableCells.csv', {
 delimiter: ';'
 }).to.array(function(dataCells) { // получаем тестовые ячеки
 //console.log(dataCells)

 var T = 0;
 var RMSE = 0;
 var E = 0;
 for (var cell=0; cell < dataCells.length; cell++) {
 cellData = {user:dataCells[cell][0],item:dataCells[cell][1],value:dataCells[cell][2]};
 data[cellData.user][cellData.item] = '';
 //cellData.value0 = getMidR(cellData.user, cellData.item, data); // MID R
 cellData.value0 = userBased(cellData.user, cellData.item, data);// USER BASED 
 data[cellData.user][cellData.item] = cellData.value;
 console.log(cellData)
 E += Math.pow((cellData.value0 - cellData.value), 2)
 T++;
 RMSE = Math.sqrt(E / T)
 console.log('T: ' + T + ' RMSE: ' + RMSE); 
 }; 
 }) 
*/


})


function userBased(userX, itemX, data) {
  var WUserUser = {}; // корееляция пользователей 
  var mids = {}; // средняя оценка пользователя по всем товарам
  var midsCommon = {};
  var commonItems = {};
  for (var userY = data.length - 1; userY >= 0; userY--) {
    commonItems[userY] = []; // общие товары
    mids[userY] = 0; // средняя оценка пользователя Y по всем товарам
    counter = 0;

    for (var i = data[userY].length - 1; i >= 0; i--) {
      if (data[userY][i]) {
        mids[userY] += parseInt(data[userY][i]);
        counter++;
      }

      if (data[userY][i] && data[userX][i]) {
        commonItems[userY].push(i);
      }
    };
    mids[userY] = mids[userY] / counter;
  };




  for (var userY = data.length - 1; userY >= 0; userY--) {
    midY = 0; // средная оценка пользоавтеля Y по общим товарам
    midX = 0; // средная оценка пользоавтеля X по общим товарам
    for (var c = commonItems[userY].length - 1; c >= 0; c--) {
      commonItems[c]
      midY += parseInt(data[userY][commonItems[userY][c]])
      midX += parseInt(data[userX][commonItems[userY][c]])
    };
    midY = midY / commonItems[userY].length;
    midX = midX / commonItems[userY].length;



    WUserUser[userY] = 0;
    if (commonItems[userY].length > 0) {
      //midY = midY / commonItems[userY].length;
      // midX = midX / commonItems[userX].length;

      uXuYS = 0;
      uX2S = 0;
      uY2S = 0;
      for (var i = commonItems[userY].length - 1; i >= 0; i--) {
        uXuYS += (data[userX][commonItems[userY][i]] - mids[userX]) * (data[userY][commonItems[userY][i]] - mids[userY])
        uX2S += Math.pow((data[userX][commonItems[userY][i]] - mids[userX]), 2);
        uY2S += Math.pow((data[userY][commonItems[userY][i]] - mids[userY]), 2);
      };


      if (uXuYS && uX2S && uY2S) {
        WUserUser[userY] = uXuYS / Math.sqrt(uX2S * uY2S);
      }
    }
  };

  rwS = 0;
  wS = 0;
  for (var userY = data.length - 1; userY >= 0; userY--) {
    if (userY != userX && data[userY][itemX]) {
      rwS += (data[userY][itemX] - mids[userY]) * WUserUser[userY];
      wS += Math.abs(WUserUser[userY]);
    }
  }

  res = mids[userX] + (rwS / wS)
  if (!res) {
    res = 0;
  }
  console.log(WUserUser);
  console.log(res);
  return res;
}

function itemBased(u, i, data) {
  var PC = {};
  var mids = {};
  var Vij = {};

  for (var j = data[0].length - 1; j >= 0; j--) {
    Vij[j] = [] // пользователи оценившие товар j и товар i
    mids[j] = 0; // средний рейтинг товара j
    counter = 0;
    for (var v = data.length - 1; v >= 0; v--) {
      if (data[v][j]) {
        mids[j] += parseInt(data[v][j]);
        counter++;
      }
      if (data[v][j] && data[v][i]) {
        Vij[j].push(v);
      }
    };
    mids[j] = mids[j] / counter
  };

  for (var j = data[0].length - 1; j >= 0; j--) {
    var Erixrj = 0;
    var Eri2 = 0;
    var Erj2 = 0;
    for (var v in Vij[j]) {
      Erixrj += (data[Vij[j][v]][i] - mids[i]) * (data[Vij[j][v]][j] - mids[j]);
      Eri2 += Math.pow((data[Vij[j][v]][i] - mids[i]), 2);
      Erj2 += Math.pow((data[Vij[j][v]][j] - mids[j]), 2);
    };
    PC[j] = Erixrj / Math.sqrt(Eri2 * Erj2);
  }
  console.log(PC);

  var EPCruj = 0;
  var EPC = 0;
  for (var j = data[0].length - 1; j >= 0; j--) {

  }

}

function itemBasedAC(u, i, data) {
  var AC = {};
  var mids = {};
  var Vij = {};

  for (var j = data[0].length - 1; j >= 0; j--) {
    Vij[j] = [] // пользователи оценившие товар j и товар i
    for (var v = data.length - 1; v >= 0; v--) {
      if (data[v][j] && data[v][i]) {
        Vij[j].push(v);
      }
    };
  };

  for (var v = data.length - 1; v >= 0; v--) {
    mids[v] = 0; // средний рейтинг товара j
    counter = 0;
    for (var j = data[v].length - 1; j >= 0; j--) {
      if (data[v][j]) {
        mids[v] += parseInt(data[v][j]);
        counter++;
      }
    };
    mids[v] = mids[v] / counter
  };

  for (var j = data[0].length - 1; j >= 0; j--) {
    var Erixrj = 0;
    var Eri2 = 0;
    var Erj2 = 0;
    for (var v in Vij[j]) {
      Erixrj += (data[Vij[j][v]][i] - mids[v]) * (data[Vij[j][v]][j] - mids[v]);
      Eri2 += Math.pow((data[Vij[j][v]][i] - mids[v]), 2);
      Erj2 += Math.pow((data[Vij[j][v]][j] - mids[v]), 2);
    };
    AC[j] = Erixrj / Math.sqrt(Eri2 * Erj2);
  }
  console.log(AC);

  var EACruj = 0;
  var EAC = 0;
  for (var j = data[0].length - 1; j >= 0; j--) {

  }

}
