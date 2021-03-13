
const { randomBytes } = require('crypto');

const idforclient = randomBytes(4).toString('hex');

let sc = require('node-nats-streaming').connect('pubit', idforclient, {
    url: 'http://nats-clusterip-srv:4222'
});

let opts = sc.subscriptionOptions()
opts.setManualAckMode(true)
opts.setAckWait(60 * 1000)

sc.on('connect',()=>{
    console.log('check service connect to NATS');


    const sub = sc.subscribe('publish:open','qgroupcheck',opts);

    sub.on('message', (msg) => {
        // console.log('Received a message [' + msg.getSequence() + '] ' + msg.getData())
        console.log('check service Received a message [publish:open]');
        let jsonData = JSON.parse(msg.getData())
        // console.log(jsonData);
        
        msg.ack()


        jsonData.title = jsonData.title.toLowerCase();
        jsonData.content = jsonData.content.toLowerCase()
        

        if(jsonData.title.includes('luv') || jsonData.content.includes('luv')){

            const data = JSON.stringify({
                publishId: jsonData.publishId,
                status:'banned'
            })

            console.log('check service found worst word');

            sc.publish('check:banned', data, () => {
                console.log('check service Send a message [check:banned]');
            })
        }
      })
    
})

