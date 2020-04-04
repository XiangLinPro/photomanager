//
//
// function _transferPhoto(req,res){
//     res.render('transferPhoto',{
//         title:'imooc 后台录入页'
//     })
//
// }
//
//
// exports.transferPhoto = _transferPhoto

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('transferPhoto',{
        title:'imooc 后台录入页'
    })

});



module.exports = router;
