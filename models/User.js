const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10; // salt가 몇 글자인지 설정 -> 10자리인 salt를 만들겠다
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 공백 제거
        unique: 1
    },
    password: {
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
        token: {    // 유효성 관리
            type: String
        },
        tokenExp: { // 토큰 사용 가능한 유효기간
            type: Number
        }
    }
})

// 저장하기 전에 비밀번호 암호화. index.js의 save 함수 실행 전에 
userSchema.pre('save', function(next){
    var user = this; // -> user가 userSchema 안의 모든 내용 포함.
    
    if(user.isModified('password')) { // 비밀번호를 바꿀시에만 암호화.
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) { // genSalt -> 솔트를 만든다
            if(err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) { 
                // myPlaintextPassword -> postMan에 설정해놓은 비밀번호 => user.password
                // hash => 암호화된 비밀번호
                if(err) return next(err)
                user.password = hash // 해시된 비밀번호로 교체 
                next()
            })
        })
    } else { 
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) { // cb: 콜백 함수 
    
    // plainPassword 1234567 을 암호화 한 후에 이미 암호화한 DB에 있는 비밀번호와 일치하는지 확인
    // 이미 암호화 한 비밀번호는 복호화 불가능 
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch)
    })

}

userSchema.methods.generateToken = function(cb) {

    var user = this;

    // jsonwebtoken을 이용해서 token을 생성하기

    var token = jwt.sign(user._id.toHexString(), 'secretToken');
    // user._id + 'secretToken' = token
    // secretToken -> user._id

    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })

}

const User = mongoose.model('User', userSchema)

module.exports = { User }