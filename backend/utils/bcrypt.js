const bcrypt = require('bcryptjs');

async function hashAdminPassword(plainTextPassword) {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt); // Hash the password with the salt
    return hashedPassword;
}

async function getHashedAdminPassword() {
    const adminPassword = '787898'; // **Replace with the actual admin password**
    const hashedPassword = await hashAdminPassword(adminPassword);
    console.log('Hashed Admin Password:', hashedPassword);
    // Copy this output and use it in your SQL INSERT statement.
}

getHashedAdminPassword();