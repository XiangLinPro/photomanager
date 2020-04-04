var express = require('express');
var router = express.Router();
var WXBizMsgCrypt = require('wechat-crypto');
var util   = require("../js/utils.js");
// var formidable = require("formidable");
var multer = require('multer')
var mysql  = require('mysql');
//导入querystring模块（解析post请求数据）
var querystring = require('querystring');
var async = require('async')

var XMLJS = require('xml2js');

var fs = require("fs");
var photo = "./uploads/photo/";
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    port: '3306',
    database: 'managerPhoto'
});


var wxconfig = {
    // token: "yBiYwwfOblCwjPKvJ",
    token: "Tc18wi",
    // encodingAESKey: "GL3Ajpw5sJXui8hU4EGdo5kgf3zIDL6TjEn7aDcYOYn",
    encodingAESKey: "pWmVyw5XGGJ6EB093ic5FgZPfeym4OQ1dcjOYtUq55d",
    corpId: "ww19577280e5593b4e",
    // secret:"7hU1h5DbsGVsVr6ggcj9jXDwJGS8vkRP3v9xXTPL5AZm4TCKfStY37qmMDrDSfXB",
    secret:"2I2FK-1a5pXJZ3n0ScktQn3_uILDWKXO6_oBe9j9MIg",
    access_token:"",
    city:""
};


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/wxcallback', function(req, res, next) {
    var msg_signature = req.query.msg_signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    //var token = "rPVYeybnMGSiVqjaWmdg0ozpg3"
    //var encodingAESKey = "WRJfWCIKek2MJlRdi7kHaEXW7ao8d6vYfaJyEYUpwde"
    var cryptor = new WXBizMsgCrypt(wxconfig.token, wxconfig.encodingAESKey, wxconfig.corpId)
    //var cryptor = new WXBizMsgCrypt(token, encodingAESKey, wxconfig.corpId)
    var s = cryptor.decrypt(echostr);
    //console.log("s="+s.message);
    res.send(s.message);
});


router.get('/index', function(req, res, next) {
    res.render('transferPhoto',{
        title:'上传照片'
    })

});

router.get('/indexx',function (req,res) {
    res.render('test1',{
        title:'上传照片'
    })
})

// router.post('/test1',function (req,res) {
//     console.log(req.body)
// })


router.post('/saveMarked',function (req,res) {

    var myDate = new Date();
    myDate.getYear(); //获取当前年份(2位)
    myDate.getFullYear(); //获取完整的年份(4位,1970-????)
    myDate.getMonth(); //获取当前月份(0-11,0代表1月)
    myDate.getDate(); //获取当前日(1-31)
    myDate.getDay(); //获取当前星期X(0-6,0代表星期天)
    myDate.getTime(); //获取当前时间(从1970.1.1开始的毫秒数)
    myDate.getHours(); //获取当前小时数(0-23)
    myDate.getMinutes(); //获取当前分钟数(0-59)
    myDate.getSeconds(); //获取当前秒数(0-59)
    myDate.getMilliseconds(); //获取当前毫秒数(0-999)
    myDate.toLocaleDateString(); //获取当前日期
    var mytime=myDate.toLocaleTimeString(); //获取当前时间
    var currenTime = myDate.toLocaleString( ); //获取日期与时间

    var timestamps = req.body.timestampss;
    var imgData = req.body.imgData;
    var marked = req.body.marked;
    // var form = new formidable.IncomingForm()
    // console.log(req);
    // file.on("data",function (imgData) {
    //     console.log(imgData);
    // })
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data,"base64")
    console.log(dataBuffer)
    var fileName =timestamps + ".jpg";
    var filePath = photo + fileName;

    fs.writeFile(filePath, dataBuffer, function(err) {
            if(err){
                res.json({code:201,msg:"图片保存失败，请重试！"})
            }else{
                var  userAddSql = 'INSERT INTO photo(marked,img,time) VALUES(?,?,?)';
                var  userAddSql_Params = [marked,fileName,currenTime];

            connection.query(userAddSql,userAddSql_Params,function (err, result) {
                if(err){
                    res.json({code:201,msg:"添加失败"})
                    return;
                }
                res.json({code:200,msg:"添加成功"})
            });
        }
    });
})


router.get('/managerPhoto', function(req, res, next) {

    var  userGetSql = "select * from photo order by time desc";
    connection.query(userGetSql,null, function (err, result) {
        if(err){
            return;
        }
        //console.log('---------------SELECT----------------');
        var crudPhoto = [];
        for (i in result)
        {
            crudPhoto[i] = new util.crudPhoto(result[i].id,result[i].marked,result[i].img);
        }
        res.render('test',{//manager-crud-photo
            crudPhoto:crudPhoto,
        })
    });
});


router.get('/editPhoto',function (req,res) {
    var id = req.query.id;

    var  userGetSql = "SELECT id, marked,img FROM photo where id = '" + id + "'";
    connection.query(userGetSql,function (err, result) {
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            return;
        }
        res.render('edit_Photo',{
            editPhoto:JSON.stringify(result),
        })
    });
})

router.post('/editPhotoInformation',function (req,res) {
    var id = req.body.id;
    var marked = req.body.marked;
    var userModSql = "UPDATE photo SET marked = ? WHERE id = '" + id + "'";
    var userModSql_Params = [marked];
    connection.query(userModSql,userModSql_Params,function (err, result) {
        if(err){
            return;
        }
        res.json({code:200,msg:"照片信息修改成功！"})

    });
})



router.post('/deletePhoto',function (req,res) {
    var id = req.body.id;

    var sql = "select img from photo where id ='"+id+"'";
    connection.query(sql,function (err, result) {
        var filepath = "";
        filepath = photo + result[0].img;
        fs.unlink(filepath, function (result) {

        })
    })

    var userDelSql = "DELETE FROM photo WHERE id ='"+id+"'";
    connection.query(userDelSql,function (err, result) {
        if(err){
            console.log('[DELETE ERROR] - ',err.message);
            return;
        }
        res.json({code:200,msg:"图片删除成功！"})
    });
})

router.post('/deleteAllPhoto',function (req,res) {
    var ids = req.body.ids;
   // console.log(ids);

    var deleteCatalogueMarked = 'select * from photo where id in '+ '(' +ids+')' ;;
    connection.query(deleteCatalogueMarked,function (err, result) {
        var filepath = "";
        for (var i =0;i<result.length;i++){
            filepath = photo+result[i].img;
            fs.unlink(filepath,function (result) {
            })
        }
    });


    var  userDelSql = 'DELETE  FROM photo WHERE id in '+ '(' +ids+')' ;

    console.log(userDelSql)
    connection.query(userDelSql,function (err, result) {

        if(err){
                res.json({code:201,msg:"批量删除失败"})
        }else{
            res.json({code:200,msg:"批量删除成功"})
        }

    });
})


router.post("/wxcallback",function (req,res) {
    //解析，将xml解析为json
    var parser = new XMLJS.Parser()

    //不做校验
    var msg_signature = req.query.msg_signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    req.on("data", function (data) {
        //将xml解析
        parser.parseString(data.toString(), function (err, result) {
            //将密文先解密
            var cryptor = new WXBizMsgCrypt(wxconfig.token, wxconfig.encodingAESKey, wxconfig.corpId);
            var msgxml = cryptor.decrypt(result.xml.Encrypt.toString()).message;
            var msgxml = cryptor.decrypt(result.xml.).message;


            parser.parseString(msgxml.toString(), function (err, result) {
                var messageType = result.xml.MsgType;
                //响应事件
                if (messageType == 'text') {
                    //responseTextMsg(result.xml, res);
                    //第一次填写URL时确认接口是否有效
                    search(req,res,result.xml.FromUserName,result.xml.Content);
                } else {
                    res.send("error");
                }
            });
        });
    });
})

function search(req,res,userid,content) {
    if((content == '？') || (content == "?")){
        //TODO 企业号成员添加、修改
        photo_operation(req,res,userid);
        return;
    }
}

function photo_operation(req,res,userid) {
    var userAddurl = "http://5srecg6uj1.51http.tech/managerPhoto";
    var articles= "{\"title\":\"操作\"}"+","+
        "{\"title\":\"用户添加\",\"url\":\""+userAddurl+"\"}"+","+
        "{\"title\":\"用户修改\",\"url\":\""+userListurl+"\"}"+","+
        "{\"title\":\"设备设置\",\"url\":\""+allDeviceurl+"\"}"
    var body = "{" +
        "\"touser\":\""+userid+"\"," +
        "\"msgtype\":\"news\"," +
        "\"agentid\":0," +
        "\"news\":{" +
        "\"articles\":[" +
        articles +
        "]" +
        "}" +
        "}";
    wx_send_msg(body,function (result) {
        var jsonobj = JSON.parse(result);
        if (jsonobj.errcode == 0){
            res.send("ok");
        }
    });
}


module.exports = router;


