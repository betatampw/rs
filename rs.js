var fs = require('fs');
var csv = require('csv');

var tableData;
var lines;

csv().from('table.csv', {
  delimiter: ';'
}).to.array(function(data) {
  //console.log(data)

  var T = 0;
  var RMSE = 0;
  var E = 0;
  for (var i = 1000; i >= 0; i--) {
    randomCell = getRandomCell(500, 8000, data);
    data[randomCell.user][randomCell.item] = '';
    randomCell.value0 = userBased(randomCell.user, randomCell.item, data);
    data[randomCell.user][randomCell.item] = randomCell.value;
    console.log(randomCell)
    E += Math.pow((randomCell.value0 - randomCell.value), 2)
    T++;
    RMSE = Math.sqrt(E / T)
    console.log('T: ' + T + ' RMSE: ' + RMSE);
  };




  /*Item-based*/
})



function getRandomCell(maxUser, maxItem, data) {
  randomUser = Math.floor(Math.random() * (maxUser - 0));
  randomItem = Math.floor(Math.random() * (maxItem - 0));
  if (data[randomUser] && data[randomUser][randomItem]) {
    return {
      user: randomUser,
      item: randomItem,
      value: data[randomUser][randomItem]
    };
  } else {
    return getRandomCell(maxUser, maxItem, data)
  }
}


function userBased(user, item, data) {
  var userX = user;
  var itemX = item;
  var WUserUser = {}; // корееляция пользователей 
  var mids = {}; // средняя оценка пользователя по всем товарам
  for (var userY = data.length - 1; userY >= 0; userY--) {
    commonItems = []; // общие товары

    midY = 0; // средная оценка пользоавтеля Y по общим товарам
    midX = 0; // средная оценка пользоавтеля X по общим товарам

    mids[userY] = 0; // средняя оценка пользователя Y по всем товарам
    counter = 0;

    for (var i = data[userY].length - 1; i >= 0; i--) {
      if (data[userY][i]) {
        mids[userY] += parseInt(data[userY][i]);
        counter++;
      }

      if (data[userY][i] && data[userX][i] && userY != userX) {
        midY += parseInt(data[userY][i]);
        midX += parseInt(data[userX][i]);
        commonItems.push(i);
      }
    };
    WUserUser[userY] = 0;
    if (commonItems.length > 0) {
      midY = midY / commonItems.length;
      midX = midX / commonItems.length;

      uXuYS = 0;
      uX2S = 0;
      uY2S = 0;
      for (var i = commonItems.length - 1; i >= 0; i--) {
        uXuYS += (data[userX][commonItems[i]] - midX) * (data[userY][commonItems[i]] - midY)
        uX2S += Math.pow((data[userX][commonItems[i]] - midX), 2);
        uY2S += Math.pow((data[userY][commonItems[i]] - midY), 2);
      };

      if (uXuYS && uX2S && uY2S) {
        WUserUser[userY] = uXuYS / Math.sqrt(uX2S * uY2S);
      }
    }

    mids[userY] = mids[userY] / counter;
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
  //console.log('User-based')
  //console.log(WUserUser);
  //console.log('User-based-res')
  //console.log(res);	
  return res;
}
