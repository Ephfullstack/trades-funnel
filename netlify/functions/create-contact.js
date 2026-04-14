exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const API_KEY = process.env.GHL_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Map incoming fields to GHL Contacts API v2 schema
  const contact = {
    firstName:   data.firstName || '',
    lastName:    data.lastName  || '',
    email:       data.email     || '',
    phone:       data.phone     || '',
    companyName: data.businessName || '',
    source:      data.source    || '£99 Trades Funnel',
    tags:        data.tags      || [],
    customFields: [
      { key: 'trade',            field_value: data.trade        || '' },
      { key: 'area',             field_value: data.area         || '' },
      { key: 'logo',             field_value: data.logo         || '' },
      { key: 'photos',           field_value: data.photos       || '' },
      { key: 'pages',            field_value: data.pages        || '' },
      { key: 'accreditations',   field_value: data.accreditations || '' },
      { key: 'notes',            field_value: data.notes        || '' },
    ].filter(f => f.field_value),
  };

  try {
    const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type':  'application/json',
        'Version':       '2021-07-28',
      },
      body: JSON.stringify(contact),
    });

    const result = await res.json();

    return {
      statusCode: res.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
