const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Account" ,
        required : [true ,  "Transaction must be accociated from an account "] ,
        index : true
    } ,
    toAccount : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Account" ,
        required : [true ,  "Transaction must be accociated with an account "] ,
        index : true       
    } ,
    status : {
        type : String ,
        enum : {
            values : ['PENDING' , 'COMPLETED' , 'FAILED' , 'REVERSED']
        } ,
        default : 'PENDING'
    } ,
    amount : {
        type : Number ,
        required : [true , "Amount is required for creating a transaction"] ,
        min : [1 , "Transection amount can't be zero or negative"]
    } ,
    idempotencyKey : {
        type : String ,
        required : [true , "Idempotance Key is required !"] ,
        index : true , 
        unique : true
    }
} , {timestamps : true});

const transactionModel = mongoose.model("Transaction" , transactionSchema);
module.exports = transactionModel;