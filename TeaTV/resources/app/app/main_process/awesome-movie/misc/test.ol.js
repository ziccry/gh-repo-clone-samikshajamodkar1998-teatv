const getOpenload = require("./ol");
const request = require("request");
require("cross-fetch/polyfill");
const { httpRequest } = require("./libs")

// request("https://openload.co/embed/aoiV82o6DQ0", function (err, res, body) {
//     console.log(body.length);
//     getOpenload(body).then(link => {
//         console.log(link);
//     });
// })

// httpRequest.getHTML("https://openload.co/embed/aoiV82o6DQ0").then(html => getOpenload(html))
// .then(link => console.log(link));

// fetch("https://openload.co/embed/aoiV82o6DQ0").then(res => res.text())
// .then(html => {
//     getOpenload(html).then(link => {
//         console.log(link);
//     });
// });

getOpenload("https://openload.co/embed/aoiV82o6DQ0").then(link => {
    console.log(link);
});