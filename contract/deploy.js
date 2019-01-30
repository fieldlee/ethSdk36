
const Web3 = require("web3");
var util = require('util');
var fs = require('fs');


var deploy = function (from, password, logger) {
    const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8541"));
    let source = fs.readFileSync("MMTToken.json");
    let contracts = JSON.parse(source);

    // ABI description as JSON structure
    let abi = contracts.abi;

    // Smart contract EVM bytecode as hex
    let code =  contracts.bytecode;
    logger.debug( abi);
    logger.debug( code);
    logger.debug( "Deploying the contract");
    web3.eth.personal.unlockAccount(from, password).then(
        (reseult)=>{
            logger.debug(util.format('==== unlockAccount result:"%s"', reseult));

            logger.debug(from);
            new web3.eth.Contract(abi)
            .deploy({
              data: code,
              arguments:[100000000,'MNT','MNT']
            })
            .send({ from: from, gas: "1000000" }).then(function (err,result) {
                logger.debug(util.format('==== deploy result:"%s"', result));
                logger.console.error(util.format('==== err :"%s"', err));
            });
        }  
    );
}

exports.deploy = deploy;