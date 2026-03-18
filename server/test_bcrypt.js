const bcrypt = require('bcryptjs');
console.log('Bcrypt loaded:', bcrypt);
try {
    bcrypt.genSalt(10).then(salt => {
        console.log('Salt:', salt);
        bcrypt.hash('password', salt).then(hash => {
            console.log('Hash:', hash);
        });
    });
} catch (e) {
    console.error('Error:', e);
}
