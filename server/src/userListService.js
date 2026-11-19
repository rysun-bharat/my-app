const { sql } = require('./db');

function isProvided(value) {
  return value !== undefined && value !== null && value !== '';
}

function isTruthy(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function buildUserListQuery(query) {
  const params = [];
  let idx = 0;
  const bind = (type, value) => {
    const name = `p${idx++}`;
    params.push({ name, type, value });
    return `@${name}`;
  };

  const conditions = [];

  if (isProvided(query.wing)) conditions.push(`personalWing = ${bind(sql.Int, Number(query.wing))}`);
  if (isProvided(query.user_id)) conditions.push(`id = ${bind(sql.BigInt, Number(query.user_id))}`);
  if (isProvided(query.fname)) conditions.push(`FirstName = ${bind(sql.NVarChar, query.fname)}`);
  if (isProvided(query.lname)) conditions.push(`LastName = ${bind(sql.NVarChar, query.lname)}`);
  if (isProvided(query.mname)) conditions.push(`MiddleName = ${bind(sql.NVarChar, query.mname)}`);
  if (isProvided(query.email)) conditions.push(`email = ${bind(sql.NVarChar, query.email)}`);
  if (isProvided(query.region)) conditions.push(`region_id = ${bind(sql.Int, Number(query.region))}`);
  if (isProvided(query.satsung_status)) conditions.push(`satsang_status_type = ${bind(sql.NVarChar, query.satsung_status)}`);
  if (isTruthy(query.bst_kst_number)) conditions.push('BstKstMember = 1');
  if (isTruthy(query.networking_individual)) conditions.push('networking_target = 1 AND personalWing IN (1,5,6,10)');
  if (isProvided(query.school_year)) conditions.push(`SchoolYear = ${bind(sql.Int, Number(query.school_year))}`);
  if (isProvided(query.user_role_type)) conditions.push(`user_role_type = ${bind(sql.Int, Number(query.user_role_type))}`);
  if (isProvided(query.center)) conditions.push(`center_id = ${bind(sql.Int, Number(query.center))}`);
  if (isProvided(query.gender)) conditions.push(`Gender = ${bind(sql.NVarChar, query.gender)}`);
  if (isProvided(query.bkms_id)) conditions.push(`id = ${bind(sql.BigInt, Number(query.bkms_id))}`);
  if (isProvided(query.user_group)) conditions.push(`group_id = ${bind(sql.Int, Number(query.user_group))}`);

  if (isProvided(query.status)) {
    const activeValues = ['Active', 'ACTIVE', 1, '1'];
    const statusValue = activeValues.includes(query.status) ? 1 : 0;
    conditions.push(`user_status = ${bind(sql.SmallInt, statusValue)}`);
  } else {
    conditions.push(`user_status = ${bind(sql.SmallInt, 1)}`);
  }

  let sabhaValues = query.sabha_attendence;
  if (isProvided(sabhaValues) && !Array.isArray(sabhaValues)) sabhaValues = [sabhaValues];
  if (Array.isArray(sabhaValues) && sabhaValues.length) {
    const sabhaConds = [];
    if (sabhaValues.some((v) => String(v) === '1')) sabhaConds.push('is_saturday_sabha = 1');
    if (sabhaValues.some((v) => String(v) === '0')) sabhaConds.push('is_saturday_sabha IS NULL');
    if (sabhaConds.length) conditions.push(`(${sabhaConds.join(' OR ')})`);
  }

  let orderClause = null;

  if (isProvided(query.name)) {
    const rawName = String(query.name).trim();
    const search = rawName.toLowerCase().replace(/\s+/g, ' ');
    const searchNoSpace = search.replace(/ /g, '');
    const nameParts = search.split(' ').filter(Boolean);

    if (nameParts.length === 1 && /^\d+$/.test(search)) {
      if (String(parseInt(search, 10)) !== search) {
        conditions.push('1 = 0');
      } else {
        conditions.push(`id = ${bind(sql.BigInt, parseInt(search, 10))}`);
      }
    } else {
      const searchPrefix = bind(sql.NVarChar, `${search}%`);
      const searchNoSpacePrefix = bind(sql.NVarChar, `${searchNoSpace}%`);

      const firstName = 'LOWER(LTRIM(RTRIM(FirstName)))';
      const middleName = 'LOWER(LTRIM(RTRIM(MiddleName)))';
      const lastName = 'LOWER(LTRIM(RTRIM(LastName)))';
      const firstNoSpace = `REPLACE(${firstName}, ' ', '')`;
      const middleNoSpace = `REPLACE(${middleName}, ' ', '')`;
      const lastNoSpace = `REPLACE(${lastName}, ' ', '')`;
      const fullName = `(${firstName} + ' ' + ISNULL(${middleName}, '') + ' ' + ${lastName})`;
      const fullNoSpace = `(${firstNoSpace} + ISNULL(${middleNoSpace}, '') + ${lastNoSpace})`;
      const firstMiddle = `(${firstNoSpace} + ISNULL(${middleNoSpace}, ''))`;
      const firstLast = `(${firstNoSpace} + ${lastNoSpace})`;
      const middleLast = `(ISNULL(${middleNoSpace}, '') + ${lastNoSpace})`;

      const ors = [];
      if (nameParts.length === 1) {
        ors.push(`baps_id LIKE ${bind(sql.NVarChar, `%${rawName}%`)}`);
      }
      ors.push(`${firstName} LIKE ${searchPrefix}`);
      ors.push(`${middleName} LIKE ${searchPrefix}`);
      ors.push(`${lastName} LIKE ${searchPrefix}`);
      ors.push(`${fullName} LIKE ${searchPrefix}`);
      ors.push(`${firstNoSpace} LIKE ${searchNoSpacePrefix}`);
      ors.push(`${middleNoSpace} LIKE ${searchNoSpacePrefix}`);
      ors.push(`${lastNoSpace} LIKE ${searchNoSpacePrefix}`);
      ors.push(`${fullNoSpace} LIKE ${searchNoSpacePrefix}`);
      ors.push(`${firstMiddle} LIKE ${searchNoSpacePrefix}`);
      ors.push(`${firstLast} LIKE ${searchNoSpacePrefix}`);
      ors.push(`${middleLast} LIKE ${searchNoSpacePrefix}`);

      const words = search.split(' ').filter(Boolean);
      if (words.length >= 2) {
        const wordGroups = words.map((word) => {
          const wordPrefix = bind(sql.NVarChar, `${word}%`);
          return `(${firstName} LIKE ${wordPrefix} OR ${middleName} LIKE ${wordPrefix} OR ${lastName} LIKE ${wordPrefix})`;
        });
        ors.push(`(${wordGroups.join(' AND ')})`);
      }

      conditions.push(`(${ors.join(' OR ')})`);

      const examSearch = bind(sql.NVarChar, search);
      const examSearchNoSpace = bind(sql.NVarChar, searchNoSpace);
      orderClause = `CASE WHEN LOWER(FirstName) = ${examSearch} THEN 0 WHEN LOWER(FirstName + LastName) = ${examSearchNoSpace} THEN 1 ELSE 2 END, LOWER(LTRIM(RTRIM(FirstName))) ASC`;
    }
  }

  const whereSql = conditions.length ? conditions.join(' AND ') : '1 = 1';
  const orderSql = orderClause ? `${orderClause}, id ASC` : 'id ASC';

  return { whereSql, orderSql, params };
}

function applyParams(request, params) {
  params.forEach((p) => request.input(p.name, p.type, p.value));
}

async function getUserList(pool, query) {
  const { whereSql, orderSql, params } = buildUserListQuery(query);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 50, 1);
  const offset = (page - 1) * limit;

  const countRequest = pool.request();
  applyParams(countRequest, params);
  const countResult = await countRequest.query(`SELECT COUNT(*) AS total FROM users WHERE ${whereSql}`);
  const totalRecords = countResult.recordset[0].total;

  const listRequest = pool.request();
  applyParams(listRequest, params);
  listRequest.input('offset', sql.Int, offset);
  listRequest.input('limit', sql.Int, limit);
  const listResult = await listRequest.query(`
    SELECT id, misid AS mis_id, baps_id, FirstName, MiddleName, LastName, email
    FROM users
    WHERE ${whereSql}
    ORDER BY ${orderSql}
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { totalRecords, records: listResult.recordset };
}

module.exports = { getUserList };
