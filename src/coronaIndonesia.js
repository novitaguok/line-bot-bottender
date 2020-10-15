var unirest = require('unirest');

module.exports = async function Corona(req, res) {
  var req = unirest('GET', 'https://covid-193.p.rapidapi.com/statistics');

  req.query({
    country: 'Indonesia',
  });

  req.headers({
    'x-rapidapi-host': 'covid-193.p.rapidapi.com',
    'x-rapidapi-key': '54ae8d0eeemsh58d84513f7c39dbp199060jsn5fb9173b2278',
  });

  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
  });
};
