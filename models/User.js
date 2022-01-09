const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10; // salt가 몇 글자인지 설정 -> 10자리인 salt를 만들겠다

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        minlength: 5
    },
    passowrd: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        minlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        token: {
            type: String
        },
        tokenExp: {
            type: Number
        }
    }
})

userSchema.pre('save', function(next){
    var user = this; // -> user가 userSchema 안의 모든 내용 포함.
    
    if(user.isModified('password')) {
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) { // genSalt -> 솔트를 만든다
            if(err) return next(err)

            bcrypt.hash(user.passowrd, salt, function(err, hash) { 
                // myPlaintextPassword -> postMan에 설정해놓은 비밀번호 => user.password
                // hash => 암호화된 비밀번호
                if(err) return next(err)
                user.passowrd = hash
                
                next()
            })
        })
    } else {
        next()
    }
})

const User = mongoose.model('User', userSchema)

module.exports = { User }