var fs = require('fs');
var csv = require('csv');

var tableData;
var lines;

csv().from('table_test.csv', {
  delimiter: ';'
}).to.array(function(data) {
  console.log(data)



  /* User-based */
  var userX = 0;
  WUserUser = {};
  var userXMean = 0;
  for (var userY = data.length - 1; userY >= 0; userY--) {
    commonItems = [];
    meanY = 0;
    meanX = 0;
    if (userY != userX) {

      for (var i = data[userY].length - 1; i >= 0; i--) {
        if (data[userY][i] && data[userX][i]) {
          meanY += parseInt(data[userY][i]);
          meanX += parseInt(data[userX][i]);
          commonItems.push(i);
        }
      };
      if (commonItems.length > 0) {
        meanY = meanY / commonItems.length; // среднее значение
        meanX = meanX / commonItems.length; // среднее значение

        uXuYS = 0;
        uX2S = 0;
        uY2S = 0;
        for (var i = commonItems.length - 1; i >= 0; i--) {
          uXuYS += (data[userX][commonItems[i]] - meanX) * (data[userY][commonItems[i]] - meanY)
          uX2S += Math.pow((data[userX][commonItems[i]] - meanX), 2);
          uY2S += Math.pow((data[userY][commonItems[i]] - meanY), 2);
        };
        WUserUser[userY] = uXuYS / Math.sqrt(uX2S * uY2S)
      }
    } else {
      userXCount = 0;
      for (var i = data[userX].length - 1; i >= 0; i--) {
        if (data[userX][i]) {
          userXCount++
          userXMean += parseInt(data[userX][i]);
        }
      }
      userXMean = userXMean / userXCount;
    }
  };
  console.log('User-based')
  console.log(WUserUser);
  console.log(userXMean)
  var itemX = 0;
  res = userXMean +
  /*Item-based*/






})
