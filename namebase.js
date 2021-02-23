const got = require('got');
const fs = require('fs');

// const names = [];

function sortByKey(array, key) {
	return array.sort(function (a, b) {
		var x = a[key]; var y = b[key];
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	});
}

(async () => {
const dates = [];
const dateToValue = {}; 
const dateToSales = {};
const names = [];
const nameToSale = {};
const nameToDate = {};

const datesJSON = [];

for (let i = 0; i < 20000; i += 100) {
  console.log(i);

  const response = await got('https://www.namebase.io/api/domains/sold/' + i.toString());
  const finalData = JSON.parse(response.body);

      for (let j = 0; j < finalData.domains.length; j++) {
        const sellDate = new Date(finalData.domains[j].created_at).toISOString().split('T')[0];
        if (!(sellDate in dateToValue)) {
          dateToValue[sellDate] = 0;
          dateToSales[sellDate] = 0;
          dates.push(sellDate);
        }
        dateToValue[sellDate] += parseFloat(finalData.domains[j].amount);
        dateToSales[sellDate] += 1
        nameToSale[finalData.domains[j].name] = parseFloat(finalData.domains[j].amount);
        nameToDate[finalData.domains[j].name] = finalData.domains[j].created_at;
        //names.push(finalData.domains[j].name);
      }

  
}

for (const dateKey in dates) {
  datesJSON.push({
    "name": dates[dates.length - dateKey - 1],
    "Volume": dateToValue[dates[dates.length - dateKey - 1]] / 1000000,
    "Sales": dateToSales[dates[dates.length - dateKey - 1]]
  });
}

for (const property in nameToSale) {
  names.push({
    col1: property,
    col2: nameToSale[property],
    col3: nameToDate[property]
  });
}
sortByKey(names, "col2");

const returnFinalNames = [];
	let counter = 1;
	for (const property in names) {
		returnFinalNames.push({
			col1: counter,
			col2: names[property].col1,
			col3: names[property].col2 / 1000000,
      col4: names[property].col3
		});
		counter++;
	}

console.log(returnFinalNames);

fs.writeFileSync('namebase.json', JSON.stringify(returnFinalNames));
fs.writeFileSync('namebasedates.json', JSON.stringify(datesJSON));

})();