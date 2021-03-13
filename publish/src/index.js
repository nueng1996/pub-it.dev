const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');


const idforclient = randomBytes(4).toString('hex');

const publishes = {};

let sc = null;


try {
    sc = require('node-nats-streaming').connect('pubit', idforclient, {
        url: 'http://nats-clusterip-srv:4222'
    });

    

    sc.on('connect', () => {
        console.log('publish service connect to NATS');

        let opts = sc.subscriptionOptions()
        opts.setManualAckMode(true)
        opts.setAckWait(60 * 1000)

        const sub = sc.subscribe('check:banned', 'qgrouppublish', opts);

        sub.on('message', (msg) => {
            // console.log('Received a message [' + msg.getSequence() + '] ' + msg.getData())
            console.log('publish service Received a message [check:banned]');
            let jsonData = JSON.parse(msg.getData())
            msg.ack()
            
            // console.log(jsonData);
            
            publishes[jsonData.publishId].status = 'banned'
            

        })


        const subclose = sc.subscribe('publish:close', 'qgroup', opts);

        subclose.on('message', (msg) => {
            // console.log('Received a message [' + msg.getSequence() + '] ' + msg.getData())
            let jsonData = JSON.parse(msg.getData())
            msg.ack()
            
            // console.log(jsonData);
            console.log('publish service Received a message [publish:close]');
            
            if (publishes[jsonData.publishId].status !== 'banned') publishes[jsonData.publishId].status = 'close'
            

        })

    });

} catch (error) {
    console.log(error);
}



const app = express();
app.use(bodyParser.json())
app.use(cors());


app.post('/api/publish/open', (req, res) => {
    const publishId = randomBytes(4).toString('hex');
    const { title, content, timems } = req.body;
    
    const timemsn = parseInt(timems)*1000;
   

    const status = 'open'
    const closeAt = new Date().toString("MMMM yyyy").split(' ').slice(0, 5).join(' ') +` after ${timems} sec`; 
    
    console.log(closeAt);
    var ipuser = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ipuser.substr(0, 7) == "::ffff:") {
        ipuser = ipuser.substr(7)
    }

    publishes[publishId] = {
        publishId,
        title,
        content,
        status,
        closeAt,
        ipuser
    }

    const data = JSON.stringify({
        publishId: publishId,
        title: title,
        content: content,
        timems:timemsn
    })
    sc.publish('publish:open', data, () => {
        console.log('publish:open send ... ');
    })

    res.status(201).send(publishes[publishId])
});
app.get('/api/publish', (req, res) => {
    
    res.status(200).send(publishes)
});

app.listen(3001, () => {
    console.log('Publish Endpoint on port 3001');
})

