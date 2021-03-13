const { randomBytes } = require('crypto');
const Queue = require('bull');







const idforclient = randomBytes(4).toString('hex');

let sc = require('node-nats-streaming').connect('pubit', idforclient, {
    url: 'http://nats-clusterip-srv:4222'
});

let opts = sc.subscriptionOptions()
opts.setManualAckMode(true)
opts.setAckWait(60 * 1000)

sc.on('connect',()=>{
    console.log('exp service connect to NATS');


    const sub = sc.subscribe('publish:open','qgroupexp',opts);

    sub.on('message', (msg) => {
        // console.log('Received a message [' + msg.getSequence() + '] ' + msg.getData())
        console.log('exp service Received a message [publish:open]');
        let jsonData = JSON.parse(msg.getData())
        // console.log(jsonData);
        
        msg.ack()
        const expq = new Queue('publish:close', {redis: {port: 6379, host: 'exp-redis-clusterip-srv'}});
        expq.process((job,done)=>{

           
            const data = JSON.stringify({
                publishId: job.data.publishId,
            })
            sc.publish('publish:close', data, () => {
                console.log('exp service Send a message [publish:close]');
            })
        
            done();
            
        })

        expq.add({publishId: jsonData.publishId},{ delay: parseInt(jsonData.timems) });

        
      })
    
})
