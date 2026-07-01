const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Account" ,
        required : [true , "Ledger must be associated with an account "] ,
        index : true ,
        immutable : true
    } ,
    amount : {
        type : Number ,
        required : [true , "Amount is required for creating a transaction !"] ,
        immutable : true
    } ,
    transaction : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Transaction" ,
        required : [true , 'Ledger must be associated with transaction'] ,
        index : true ,

        immutable : true
    } ,
    type : {
        type : String ,
        enum : {
            values : ["CREDIT" , "DEBIT"]
        } ,
        required : [true , "Ledger type is required !"] ,
        immutable : true
    }
});

function preventCRUD () {
    throw new Error("ledger enteries are immutable and can't be updated or deleted")
};

ledgerSchema.pre("findOneAndUpdate" , preventCRUD)
ledgerSchema.pre("updateOne" , preventCRUD)
ledgerSchema.pre("deleteOne" , preventCRUD)
ledgerSchema.pre("remove" , preventCRUD)
ledgerSchema.pre("deleteMany" , preventCRUD)
ledgerSchema.pre("findOneAndDelete" , preventCRUD)
ledgerSchema.pre("findOneAndReplace" , preventCRUD)


const ledgerModel = mongoose.model("Ledger" , ledgerSchema);
module.exports = ledgerModel;