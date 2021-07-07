var mongoose = require('mongoose');

var data = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    EmployeeName: {
        type: String,
        required: 'This field is required!'
        },
        Phone: {
        type: String
        },
        Department: {
        type: String
        }
        
  
}, { collection: 'Machines' });

var machine = mongoose.model('machine', data);

module.exports = machine;


