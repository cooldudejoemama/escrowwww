const Web3 = require('web3');

const web3 = new Web3('wss://goerli.infura.io/ws/v3/123c794525a74370b395d8532045b77e');

const escrowABI = require('./escrowABI.json');
const escrowAddress = '0x91075FD0840544cc5F203C66B8a4efBf28BF6683';

const escrowContract = new web3.eth.Contract(escrowABI, escrowAddress);

web3.eth.net.isListening()
.then(() => console.log('is connected cutely'))
.catch(e => console.log('Wow. Something went wrong'));

// Listen to the 'newBlockHeaders' event
web3.eth.subscribe('newBlockHeaders', (error, result) => {
    if (!error) {
        checkReceivedEvents(result.number, result.number);
    }
});

// Check 'ReceivedEther' events from the given block
function checkReceivedEvents(fromBlock, toBlock) {
    escrowContract.getPastEvents('ReceivedEther', { fromBlock, toBlock })
    .then(events => {
        for (let event of events) {
            const sender = event.returnValues.from;
            const value = event.returnValues.value;
            console.log(`Received ${web3.utils.fromWei(value, 'ether')} Ether from ${sender}`);
        }
    })
    .catch(console.error);
}

console.log(escrowContract.events);

module.exports = { startListening: checkReceivedEvents };
