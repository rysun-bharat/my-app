require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { login, logout } = require('./authService');
const { authMiddleware } = require('./authMiddleware');
const { getUserList } = require('./userListService');
const { getPool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/bkms-api/v2/auth/login', async (req, res) => {
  const { bkms_id, email_address, password, fcm_token } = req.body || {};

  if (!bkms_id || !email_address || !password) {
    return res.status(422).json({ status: false, message: 'bkms_id, email_address and password are required' });
  }

  try {
    const result = await login({
      bkmsId: bkms_id,
      email: email_address,
      password,
      fcmToken: fcm_token,
    });

    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, message: 'Login Successfully', data: result.data });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ status: false, message: 'Something went wrong' });
  }
});

app.post('/bkms-api/v2/auth/logout', authMiddleware, async (req, res) => {
  try {
    await logout(req.userId);
    return res.json({ status: true, message: 'Logout Successfully', data: '' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ status: false, message: 'Something went wrong' });
  }
});

app.get('/bkms-api/v2/user-list', authMiddleware, async (req, res) => {
  try {
    const pool = await getPool();
    const { totalRecords, records } = await getUserList(pool, req.query);
    return res.json({ status: true, message: 'Record Data', data: { total_records: totalRecords, records } });
  } catch (err) {
    console.error('User list error:', err);
    return res.status(500).json({ status: false, message: 'Something went wrong' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Auth server listening on http://127.0.0.1:${port}`);
});
