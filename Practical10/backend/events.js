const EventEmitter=require('events')

class TaskEvent extends EventEmitter {}

module.exports=new TaskEvent();