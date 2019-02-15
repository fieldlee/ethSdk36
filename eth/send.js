
'use strict'

var util = require('util');
var fs = require('fs');
var path = require('path');

var signEth = function (res, web3, configPath, logger, from, to, value, privatekey) {

    var config = JSON.parse(fs.readFileSync(configPath));
    var tx = {
        from: from,
        to: to,
        value: web3.utils.toWei(value, "ether"),
        // gasPrice:1000000000,
        gas: 1000000,
    };
    web3.eth.accounts.signTransaction(tx, privatekey, false).then((signed) => {
        logger.debug(util.format('==== signed:"%s"', signed));
        logger.debug(util.format('==== signed.rawTransaction:"%s"', signed.rawTransaction));

        var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
        tran.on('confirmation', (confirmationNumber, receipt) => {
            logger.debug(util.format('==== confirmationNumber:"%s"', confirmationNumber));
            logger.debug(util.format('==== receipt result:"%s"', receipt));
        });
        tran.on('transactionHash', hash => {
            logger.debug(util.format('==== transactionHash:"%s"', hash));
        });
        tran.on('receipt', receipt => {
            logger.debug(util.format('==== receipt:"%s"', receipt));
        });
    }, (err) => {
        logger.error(util.format(' Err: "%s"', err));
    });
};
var sentEth = function(res,web3, configPath,logger,from,to,value) {

    var config = JSON.parse(fs.readFileSync(configPath));
    logger.debug(util.format('blockNumber: "%s"', web3.eth.blockNumber));
    logger.debug(util.format('defaultblock:"%s"',web3.eth.defaultBlock));
    
    var tx = {
        from : from,
        to : to,
        value : web3.utils.toWei(value, "ether"),
        // gasPrice:1000000000,
        gas:1000000,
    };

    web3.eth.personal.unlockAccount(from, "password").then(
        (result)=>{
            logger.debug(util.format("result:%s",result));
            web3.eth.sendTransaction(tx).on('transactionHash', function(hash){
                logger.debug(util.format("hash:%s",hash));
                res.status(200).json({"status":util.format("tx:%s",hash)});
            })
            .on('receipt', function(receipt){
                logger.debug(util.format("receipt:%s",JSON.stringify(receipt)));
            })
            .on('confirmation', function(confirmationNumber, receipt){ 
                logger.debug(util.format("confirmationNumber:%s,receipt:%s",JSON.stringify(confirmationNumber),JSON.stringify(receipt)));
             })
            .on('error', function (error) {
                logger.error(util.format("error:%s",error));
                // logger.debug(util.format("confirmationNumber:%s,receipt:%s",confirmationNumber,receipt));
                res.status(200).json({"error":util.format("error:%s",error)});
            });
            
        },
        (err)=>{
            res.status(400).json({"status":util.format('err:"%s"',err)});
        }
    );
};


var getEth = function(res,web3, configPath,logger,from) {
    var config = JSON.parse(fs.readFileSync(configPath));
    logger.debug(util.format('blockNumber: "%s"', web3.eth.blockNumber));
    logger.debug(util.format('defaultblock:"%s"',web3.eth.defaultBlock));
    
    web3.eth.getBalance(from,function (err,blc) {
        if (err != null) {
            logger.error(err);
        }else{
            logger.debug(util.format('====Balance:"%s"ETH,"%s"WEI',web3.utils.fromWei(blc),blc));
            res.status(200).json({"Balance":util.format('====Balance:"%s"ETH,"%s"WEI',web3.utils.fromWei(blc),blc)});
        }
    });
};
exports.sentEth = sentEth;
exports.getEth = getEth;
exports.signEth = signEth;