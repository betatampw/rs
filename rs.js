var fs = require('fs');
var csv = require('csv');

var tableData;
var lines;

csv().from('table.csv', { // получаем матрицу рейтингов
  delimiter: ';'
}).to.array(function(data) {
  //console.log(data)


  console.log(itemBased(0, 0, data))

  var tmpR = 0;
  var T = 0;
  var E_UB = 0;
  var E_IB_PC = 0;
  var E_IB_AC = 0;
  for (var u = data.length - 1; u >= 0; u--) {
    for (var i = data[u].length - 1; i >= 0; i--) {
      if (data[u][i]) {
        T++;
        tmpR = data[u][i];
        data[u][i] = false;
        UB = userBased(u, i, data);
        IB_PC = itemBased(u, i, data);
        IB_AC = itemBasedAC(u, i, data);

        E_UB += Math.pow((UB - tmpR), 2)
        E_IB_PC += Math.pow((IB_PC - tmpR), 2)
        E_IB_AC += Math.pow((IB_AC - tmpR), 2)

        RMSE_UB = Math.sqrt(E_UB / T);
        RMSE_IB_PC = Math.sqrt(E_IB_PC / T);
        RMSE_IB_AC = Math.sqrt(E_IB_AC / T);
        console.log("UB:(" + UB.toFixed(2) + ") " + RMSE_UB.toFixed(4) + "  IB_PC:(" + IB_PC.toFixed(2) + ") " + RMSE_IB_PC.toFixed(4) + "  IB_AC:(" + IB_AC.toFixed(2) + ") " + RMSE_IB_AC.toFixed(4) + " U:" + u + "  I:" + i + " R:" + tmpR)
        data[u][i] = tmpR;
      }
    };
  };

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
  //console.log(WUserUser);
  // console.log(res);
  return res;
}

function itemBased(u, i, data) {
  var PC = {};
  var mids = {};
  var Vij = {};
  var counter;

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
    PC[j] = 0;
    for (var v in Vij[j]) {
      Erixrj += (data[Vij[j][v]][i] - mids[i]) * (data[Vij[j][v]][j] - mids[j]);
      Eri2 += Math.pow((data[Vij[j][v]][i] - mids[i]), 2);
      Erj2 += Math.pow((data[Vij[j][v]][j] - mids[j]), 2);
    };
    if (Erixrj && Eri2 && Erj2) {
      PC[j] = Erixrj / Math.sqrt(Eri2 * Erj2);
    }

  }
  //console.log(PC);

  var EPCruj = 0;
  var EPC = 0;
  var rui = 0;
  for (var j = data[0].length - 1; j >= 0; j--) {
    if (data[u][j]) {
      EPCruj += (data[u][j] - mids[j]) * PC[j]
      EPC += Math.abs(PC[j])
    }
  }
  if (EPC) {
    rui = mids[i] + EPCruj / EPC;
  }
  //console.log(rui);
  return rui;
}

function itemBasedAC(u, i, data) {
  var AC = {};
  var mids = {};
  var midsItem = {};
  var Vij = {};
  var counter;
  for (var j = data[0].length - 1; j >= 0; j--) {
    Vij[j] = [] // пользователи оценившие товар j и товар i
    midsItem[j] = 0; // средний рейтинг товара j
    counter = 0;
    for (var v = data.length - 1; v >= 0; v--) {
      if (data[v][j]) {
        midsItem[j] += parseInt(data[v][j]);
        counter++;
      }
      if (data[v][j] && data[v][i]) {
        Vij[j].push(v);
      }
    };
    midsItem[j] = midsItem[j] / counter
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
    AC[j] = 0;
    for (var v in Vij[j]) {
      Erixrj += (data[Vij[j][v]][i] - mids[v]) * (data[Vij[j][v]][j] - mids[v]);
      Eri2 += Math.pow((data[Vij[j][v]][i] - mids[v]), 2);
      Erj2 += Math.pow((data[Vij[j][v]][j] - mids[v]), 2);
    };
    if (Erixrj && Eri2 && Erj2) {
      AC[j] = Erixrj / Math.sqrt(Eri2 * Erj2);
    }
  }
  //console.log(AC);

  var EACruj = 0;
  var EAC = 0;
  var rui = 0;
  for (var j = data[0].length - 1; j >= 0; j--) {
    if (data[u][j]) {
      EACruj += (data[u][j] - midsItem[j]) * AC[j]
      EAC += Math.abs(AC[j])
    }
  }
  if (EAC) {
    rui = midsItem[i] + EACruj / EAC;
  }
  //console.log(rui);
  return rui;
}
