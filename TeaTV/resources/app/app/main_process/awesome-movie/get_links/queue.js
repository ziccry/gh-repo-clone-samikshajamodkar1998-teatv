const EventRegister = require("js-events-listener");
const MAX_OF_DOING = 5;
const ONE_QUEUE_TIMEOUT = 10000;

const randomString = length => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
  
    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }
  
    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

class Queue {
    constructor() {
        this.queueArray = [];
        this.state = {
            doing: 0,
            queued: 0,
            completed: 0,
        };
    }

    addToQueue(func) {
        return new Promise((resolve, reject) => {
            let id = randomString(20);
            this.queueArray.push({id, func, status: "queued"});
            this.state.queued++;
            this._checkAndExecuteQueue();
            let done = false;
            EventRegister.on("QUEUE_DONE_" + id, (data) => {
                if(done) return;
                resolve(data);
            })
        });
    }

    _changeItemStatus(id, status) {
        let item = this.queueArray.find(val => val.id === id);
        item.status = status;
        if (status === "doing") {
            this.state.queued--;
            this.state.doing++;
        } else if (status == "completed") {
            this.state.doing--;
            this.state.completed++;
        }
    }

    async _checkAndExecuteQueue() {
        if (this.state.doing >= this.MAX_OF_DOING) return;
        let data            = this._getOneQueue();
        if (data == null) return;
        this._changeItemStatus(data.id, "doing");
        let didTimeout      = false;
        const runWhenDone   = (result) => {
            this._changeItemStatus(data.id, "completed");
            EventRegister.emit("QUEUE_DONE_" + data.id, result);
            this._checkAndExecuteQueue();
        }
        let timeoutHandle = setTimeout(() => {
            didTimeout = true;
            runWhenDone();
        }, ONE_QUEUE_TIMEOUT );
        let result = await data.func();
        clearTimeout(timeoutHandle);
        didTimeout === false && runWhenDone(result);
    }

    _getOneQueue() {
        let queueArr = this.queueArray.filter(val => val.status === "queued");
        if (queueArr.length === 0) return null;
        return queueArr[0];
    }
}

module.exports = new Queue();