const mongoose=require('mongoose');

const commentSchema=new mongoose.Schema({
  content:{
    type:String,
    required:true,
    trim:true
  },
  postId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post',
    required:true
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }]
},{
  timestamps:true
});

module.exports=mongoose.model('Comment',commentSchema);