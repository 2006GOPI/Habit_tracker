import axios from 'axios';

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testu' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'password123'
        });
        console.log('Success:', res.data);
    } catch (err) {
        if (err.response) {
            console.log('Error Status:', err.response.status);
            console.log('Error Data:', err.response.data);
        } else {
            console.log('Error:', err.message);
        }
    }
}

testRegister();
