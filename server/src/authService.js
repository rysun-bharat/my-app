const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('./db');

const BAL_WING_NAMES = ['bal', 'balak', 'balika'];
const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS || 3600);

function isAge18Below(dob) {
  if (!dob) return false;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age < 18;
}

function issueToken(userId) {
  const accessToken = jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: EXPIRES_IN_SECONDS });
  const refreshToken = jwt.sign({ sub: String(userId), type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

async function findSelfLoginUser(pool, id, email) {
  const result = await pool
    .request()
    .input('id', sql.BigInt, id)
    .input('email', sql.NVarChar, email)
    .query('SELECT * FROM users WHERE id = @id AND email = @email AND user_status = 1');
  return result.recordset[0] || null;
}

async function findParentLoginUser(pool, id, email) {
  const result = await pool
    .request()
    .input('id', sql.BigInt, id)
    .input('email', sql.NVarChar, email)
    .query(`
      SELECT u.*, w.wingName AS wingName, g.MotherEmail AS MotherEmail, g.FatherEmail AS FatherEmail
      FROM users u
      LEFT JOIN wing w ON w.id = u.personalWing
      INNER JOIN usersmeta_guardian g ON g.user_id = u.id
      WHERE u.id = @id AND (g.MotherEmail = @email OR g.FatherEmail = @email)
    `);
  return result.recordset[0] || null;
}

async function persistLoginTokens(pool, userId, { accessToken, refreshToken, fcmToken, existingFcmToken }) {
  await pool
    .request()
    .input('id', sql.BigInt, userId)
    .input('accessToken', sql.Text, accessToken)
    .input('refreshToken', sql.Text, refreshToken)
    .input('fcmToken', sql.NVarChar, fcmToken ?? existingFcmToken ?? null)
    .query(`
      UPDATE users
      SET access_token = @accessToken,
          refresh_token = @refreshToken,
          refresh_token_date = GETDATE(),
          fcm_token = @fcmToken,
          last_attempt_time = GETDATE(),
          last_login_mode = 'BKMS'
      WHERE id = @id
    `);
}

function buildResponseData({ user, loginUserType, loginParentType, accessToken, refreshToken }) {
  return {
    login_user_type: loginUserType,
    login_parent_type: loginParentType,
    f_name: user.FirstName,
    l_name: user.LastName,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: EXPIRES_IN_SECONDS,
    bkms_id: user.id,
    role: user.user_role_type != null ? Number(user.user_role_type) : null,
    mis_id: user.misid != null ? Number(user.misid) : null,
  };
}

async function login({ bkmsId, email, password, fcmToken }) {
  const pool = await getPool();

  const selfUser = await findSelfLoginUser(pool, bkmsId, email);
  if (selfUser && (await bcrypt.compare(password, selfUser.password))) {
    const { accessToken, refreshToken } = issueToken(selfUser.id);
    await persistLoginTokens(pool, selfUser.id, {
      accessToken,
      refreshToken,
      fcmToken,
      existingFcmToken: selfUser.fcm_token,
    });
    return {
      ok: true,
      data: buildResponseData({
        user: selfUser,
        loginUserType: 1,
        loginParentType: 'User',
        accessToken,
        refreshToken,
      }),
    };
  }

  const parentRow = await findParentLoginUser(pool, bkmsId, email);
  if (!parentRow) {
    return { ok: false, message: 'Invalid Credentials' };
  }

  const parentPasswordOk = await bcrypt.compare(password, parentRow.parent_password || '');
  if (!parentPasswordOk) {
    return { ok: false, message: 'Invalid Credentials' };
  }

  const loginParentType = String(parentRow.MotherEmail || '').trim() === email.trim() ? 'Mother' : 'Father';
  const wingName = String(parentRow.wingName || '').trim().toLowerCase();
  const loginUserType = BAL_WING_NAMES.includes(wingName)
    ? 2
    : isAge18Below(parentRow.DOB)
      ? 2
      : 3;

  const { accessToken, refreshToken } = issueToken(parentRow.id);
  await persistLoginTokens(pool, parentRow.id, {
    accessToken,
    refreshToken,
    fcmToken,
    existingFcmToken: parentRow.fcm_token,
  });

  return {
    ok: true,
    data: buildResponseData({
      user: parentRow,
      loginUserType,
      loginParentType,
      accessToken,
      refreshToken,
    }),
  };
}

async function logout(userId) {
  const pool = await getPool();
  await pool.request().input('id', sql.BigInt, userId).query('UPDATE users SET access_token = NULL WHERE id = @id');
}

module.exports = { login, logout };
