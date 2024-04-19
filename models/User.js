const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({

   user : { type: String, required: true, unique: true},
   email: { type: String, required: true, unique: true},
   pass : { type: String, required: true}
})
//middleware para hashear la constrasena
userSchema.pre('save', async function(next) {
    if (this.isModified('pass')){
        this.pass = await bcrypt.hash(this.pass, 10);
    }
    next();
  });
//// comparar contrasenas
userSchema.methods.comparePassword = async function (contrasenaEsperada){
    return await bcrypt.compare(contrasenaEsperada, this.pass);
};

const UsuarioModel = mongoose.model('User',userSchema,'user');
module.exports = UsuarioModel;