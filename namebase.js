const https = require('https');

// const names = [];

(async () => {
const dates = [];
const dateToValue = {}; 

for (let i = 0; i < 1000; i += 100) {
  console.log(i);
  https.get('https://www.namebase.io/api/domains/sold/' + i.toString(), (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      const finalData = JSON.parse(data);
      //console.log(finalData);
      for (let j = 0; j < finalData.domains.length; j++) {
        const sellDate = new Date(finalData.domains[j].created_at).toISOString().split('T')[0];
        if (!(sellDate in dateToValue)) {
          dateToValue[sellDate] = 0;
          dates.push(sellDate);
        }
        dateToValue[sellDate] += parseInt(finalData.domains[j].amount);
        //console.log(dateToValue[sellDate], sellDate);
      }
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
  
}
console.log(names);
});