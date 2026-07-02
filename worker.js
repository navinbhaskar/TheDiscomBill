const COMPLAINT_PREFIX = 'complaint:';
const CHAT_PREFIX = 'chat:';
const MAX_FILES = 10;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        const status = err.status || 500;
        return json({ error: true, message: err.message || 'Server error' }, status);
      }
    }
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not found', { status: 404 });
  }
};

async function handleApi(request, env, url) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  requireStorage(env);

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api') throw new ApiError(404, 'Unknown API route');

  if (parts[1] === 'complaints' && parts.length === 2 && request.method === 'POST') {
    return createComplaint(request, env);
  }
  if (parts[1] === 'complaints' && parts.length === 3 && request.method === 'GET') {
    const record = await requireComplaint(env, parts[2]);
    requireCaseToken(url, record);
    return json({ complaint: publicComplaint(record, true) });
  }
  if (parts[1] === 'complaints' && parts.length === 4 && parts[3] === 'chat') {
    const record = await requireComplaint(env, parts[2]);
    const actor = authorizeCaseActor(request, env, url, record);
    if (request.method === 'GET') return getChat(env, record, actor);
    if (request.method === 'POST') return addChatMessage(request, env, record, actor);
  }
  if (parts[1] === 'complaints' && parts.length === 5 && parts[3] === 'files' && request.method === 'GET') {
    return downloadFile(request, env, url, parts[2], parts[4]);
  }

  if (parts[1] === 'expert') {
    requireExpert(request, env);
    if (parts[2] === 'complaints' && parts.length === 3 && request.method === 'GET') {
      return listComplaints(env);
    }
    if (parts[2] === 'complaints' && parts.length === 4 && request.method === 'GET') {
      const record = await requireComplaint(env, parts[3]);
      return json({ complaint: publicComplaint(record, false) });
    }
    if (parts[2] === 'complaints' && parts.length === 5 && parts[4] === 'accept' && request.method === 'POST') {
      return acceptComplaint(request, env, parts[3]);
    }
    if (parts[2] === 'complaints' && parts.length === 5 && parts[4] === 'complete' && request.method === 'POST') {
      return completeComplaint(env, parts[3]);
    }
  }

  throw new ApiError(404, 'Unknown API route');
}

async function createComplaint(request, env) {
  const form = await request.formData();
  const id = makeId('CR');
  const accessToken = crypto.randomUUID();
  const now = new Date().toISOString();

  const files = form.getAll('documents').filter(file => file && file.name && file.size > 0);
  if (files.length > MAX_FILES) throw new ApiError(400, 'Upload up to ' + MAX_FILES + ' documents per complaint.');

  const maxBytes = Number(env.COMPLAINT_UPLOAD_MAX_BYTES || DEFAULT_MAX_BYTES);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > maxBytes) throw new ApiError(400, 'Total upload size must stay under ' + formatBytes(maxBytes) + '.');

  const documents = [];
  for (const file of files) {
    const fileId = crypto.randomUUID();
    const safeName = cleanFileName(file.name);
    const key = id + '/' + fileId + '-' + safeName;
    await env.BILL_DOCUMENTS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
      customMetadata: { complaintId: id, fileId, originalName: safeName }
    });
    documents.push({
      id: fileId,
      name: safeName,
      type: file.type || 'application/octet-stream',
      size: file.size,
      key,
      uploadedAt: now
    });
  }

  const record = {
    id,
    accessToken,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
    acceptedAt: null,
    completedAt: null,
    assignedTo: null,
    state: readText(form, 'state'),
    discomId: readText(form, 'discomId'),
    discomName: readText(form, 'discomName'),
    complaintType: readText(form, 'complaintType'),
    priority: readText(form, 'priority') || 'normal',
    consumerNumber: readText(form, 'consumerNumber'),
    billAmount: readText(form, 'billAmount'),
    disputedAmount: readText(form, 'disputedAmount'),
    summary: readText(form, 'summary'),
    requestedHelp: readText(form, 'requestedHelp'),
    contact: {
      name: readText(form, 'name'),
      phone: readText(form, 'phone'),
      email: readText(form, 'email'),
      city: readText(form, 'city')
    },
    documents
  };

  validateComplaint(record);
  await saveComplaint(env, record);
  await saveChat(env, id, [{
    id: crypto.randomUUID(),
    role: 'system',
    name: 'TheDiscomBill',
    message: 'Complaint submitted. Chat opens after an expert accepts this case.',
    createdAt: now
  }]);

  return json({ complaint: publicComplaint(record, true), accessToken }, 201);
}

async function listComplaints(env) {
  const listed = await env.COMPLAINTS_KV.list({ prefix: COMPLAINT_PREFIX, limit: 200 });
  const records = await Promise.all(listed.keys.map(k => env.COMPLAINTS_KV.get(k.name, 'json')));
  const complaints = records
    .filter(Boolean)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .map(record => publicComplaint(record, false));
  return json({ complaints });
}

async function acceptComplaint(request, env, id) {
  const body = await request.json().catch(() => ({}));
  const expertName = cleanText(body.expertName || 'Expert');
  const record = await requireComplaint(env, id);
  if (record.status === 'completed') throw new ApiError(409, 'This complaint is already completed.');

  const now = new Date().toISOString();
  record.status = 'accepted';
  record.assignedTo = expertName;
  record.acceptedAt = record.acceptedAt || now;
  record.updatedAt = now;
  await saveComplaint(env, record);

  const chat = await readChat(env, id);
  chat.push({
    id: crypto.randomUUID(),
    role: 'system',
    name: 'TheDiscomBill',
    message: expertName + ' accepted this complaint. Chat is now open.',
    createdAt: now
  });
  await saveChat(env, id, chat);

  return json({ complaint: publicComplaint(record, false) });
}

async function completeComplaint(env, id) {
  const record = await requireComplaint(env, id);
  const now = new Date().toISOString();
  record.status = 'completed';
  record.completedAt = now;
  record.updatedAt = now;
  await saveComplaint(env, record);
  return json({ complaint: publicComplaint(record, false) });
}

async function getChat(env, record, actor) {
  const messages = await readChat(env, record.id);
  return json({ messages, chatOpen: record.status === 'accepted' || record.status === 'completed', actor });
}

async function addChatMessage(request, env, record, actor) {
  if (record.status !== 'accepted') {
    throw new ApiError(409, 'Chat opens after an expert accepts the complaint.');
  }
  const body = await request.json().catch(() => ({}));
  const message = cleanText(body.message);
  if (!message) throw new ApiError(400, 'Message is required.');
  if (message.length > 2500) throw new ApiError(400, 'Message is too long.');

  const now = new Date().toISOString();
  const chat = await readChat(env, record.id);
  chat.push({
    id: crypto.randomUUID(),
    role: actor.role,
    name: actor.name || (actor.role === 'expert' ? record.assignedTo || 'Expert' : record.contact.name || 'Customer'),
    message,
    createdAt: now
  });
  record.updatedAt = now;
  await Promise.all([saveChat(env, record.id, chat), saveComplaint(env, record)]);
  return json({ messages: chat });
}

async function downloadFile(request, env, url, complaintId, fileId) {
  const record = await requireComplaint(env, complaintId);
  authorizeCaseActor(request, env, url, record);
  const doc = record.documents.find(item => item.id === fileId);
  if (!doc) throw new ApiError(404, 'Document not found.');
  const object = await env.BILL_DOCUMENTS.get(doc.key);
  if (!object) throw new ApiError(404, 'Document file missing.');

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Disposition', 'attachment; filename="' + doc.name.replace(/"/g, '') + '"');
  headers.set('Cache-Control', 'private, no-store');
  return new Response(object.body, { headers });
}

function publicComplaint(record, includeTokenLinks) {
  return {
    id: record.id,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    acceptedAt: record.acceptedAt,
    completedAt: record.completedAt,
    assignedTo: record.assignedTo,
    state: record.state,
    discomId: record.discomId,
    discomName: record.discomName,
    complaintType: record.complaintType,
    priority: record.priority,
    consumerNumber: record.consumerNumber,
    billAmount: record.billAmount,
    disputedAmount: record.disputedAmount,
    summary: record.summary,
    requestedHelp: record.requestedHelp,
    contact: record.contact,
    documents: record.documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      downloadUrl: includeTokenLinks ? '/api/complaints/' + record.id + '/files/' + doc.id : null
    }))
  };
}

function requireStorage(env) {
  if (!env.COMPLAINTS_KV || !env.BILL_DOCUMENTS) {
    throw new ApiError(503, 'Complaint storage is not configured. Add COMPLAINTS_KV and BILL_DOCUMENTS bindings in Cloudflare.');
  }
}

function requireExpert(request, env) {
  if (!env.EXPERT_ACCESS_KEY) throw new ApiError(503, 'Expert access key is not configured.');
  const given = request.headers.get('x-expert-key') || '';
  if (given !== env.EXPERT_ACCESS_KEY) throw new ApiError(401, 'Invalid expert access key.');
}

function authorizeCaseActor(request, env, url, record) {
  const expertKey = request.headers.get('x-expert-key') || '';
  if (env.EXPERT_ACCESS_KEY && expertKey === env.EXPERT_ACCESS_KEY) {
    return { role: 'expert', name: record.assignedTo || 'Expert' };
  }
  requireCaseToken(url, record);
  return { role: 'user', name: record.contact.name || 'Customer' };
}

function requireCaseToken(url, record) {
  const token = url.searchParams.get('token') || '';
  if (!token || token !== record.accessToken) throw new ApiError(401, 'Invalid case access token.');
}

async function requireComplaint(env, id) {
  const record = await env.COMPLAINTS_KV.get(caseKey(id), 'json');
  if (!record) throw new ApiError(404, 'Complaint not found.');
  return record;
}

function saveComplaint(env, record) {
  return env.COMPLAINTS_KV.put(caseKey(record.id), JSON.stringify(record));
}

async function readChat(env, id) {
  return await env.COMPLAINTS_KV.get(chatKey(id), 'json') || [];
}

function saveChat(env, id, messages) {
  return env.COMPLAINTS_KV.put(chatKey(id), JSON.stringify(messages));
}

function caseKey(id) {
  return COMPLAINT_PREFIX + id;
}

function chatKey(id) {
  return CHAT_PREFIX + id;
}

function validateComplaint(record) {
  if (!record.contact.name) throw new ApiError(400, 'Name is required.');
  if (!record.contact.phone && !record.contact.email) throw new ApiError(400, 'Phone or email is required.');
  if (!record.state) throw new ApiError(400, 'State is required.');
  if (!record.discomId) throw new ApiError(400, 'DISCOM is required.');
  if (!record.complaintType) throw new ApiError(400, 'Complaint type is required.');
  if (!record.summary || record.summary.length < 20) throw new ApiError(400, 'Please describe the complaint in at least 20 characters.');
}

function readText(form, key) {
  return cleanText(form.get(key));
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanFileName(name) {
  return String(name || 'document')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 120) || 'document';
}

function makeId(prefix) {
  const chars = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
  return prefix + '-' + chars;
}

function formatBytes(bytes) {
  return Math.round(bytes / 1024 / 1024) + ' MB';
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
