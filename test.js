const http = require('http');

const BASE_URL = 'http://localhost:3000';
let TOKEN = '';
let userId = null;
let teamId = null;
let categoryId = null;
let priorityId = null;
let ticketId = null;
let commentId = null;
let secondUserId = null;

const results = [];

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ status: res.statusCode, body: parsed });
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function log(name, res, expectedStatus) {
    const ok = Array.isArray(expectedStatus)
        ? expectedStatus.includes(res.status)
        : res.status === expectedStatus;
    const icon = ok ? 'PASS' : 'FAIL';
    const msg = `[${icon}] ${name} — ${res.status} (attendu: ${expectedStatus})`;
    results.push({ name, ok, status: res.status, expectedStatus });
    console.log(msg);
    console.log('  Body:', JSON.stringify(res.body).substring(0, 300));
    return res;
}

async function run() {
    console.log('=== DEBUT DES TESTS ===\n');

    // ─── AUTH : SIGNIN ───
    {
        const res = await request('POST', '/auth/signin', {
            full_name: 'Test User',
            email: 'test@nexora.com',
            password: 'password123',
            role: 'support'
        });
        log('Auth: Signin (register)', res, 201);
        if (res.body && res.body.id) userId = res.body.id;
    }

    // ─── AUTH : LOGIN ───
    {
        const res = await request('POST', '/auth/login', {
            email: 'test@nexora.com',
            password: 'password123'
        });
        log('Auth: Login', res, 200);
        if (res.body && res.body.token) TOKEN = res.body.token;
    }

    if (!TOKEN) {
        console.log('\n*** Impossible de continuer sans token. Arret. ***');
        printSummary();
        return;
    }

    // ─── AUTH : Login mauvais mdp ───
    {
        const res = await request('POST', '/auth/login', {
            email: 'test@nexora.com',
            password: 'wrong'
        });
        log('Auth: Login mauvais mdp', res, 400);
    }

    // ─── AUTH : Signin doublon ───
    {
        const res = await request('POST', '/auth/signin', {
            full_name: 'Test User',
            email: 'test@nexora.com',
            password: 'password123',
            role: 'support'
        });
        log('Auth: Signin doublon', res, 400);
    }

    // ─── USERS : CREATE ───
    {
        const res = await request('POST', '/users', {
            full_name: 'Bob Martin',
            email: 'bob@nexora.com',
            password: 'password123',
            role: 'collaborateur'
        });
        log('Users: Create', res, 201);
        if (res.body && res.body.id) secondUserId = res.body.id;
    }

    // ─── USERS : GET ALL ───
    {
        const res = await request('GET', '/users', null, TOKEN);
        log('Users: Get All', res, 200);
    }

    // ─── USERS : GET BY ID ───
    {
        const res = await request('GET', `/users/${userId}`, null, TOKEN);
        log('Users: Get By Id', res, 200);
    }

    // ─── USERS : UPDATE ───
    {
        const res = await request('PUT', `/users/${userId}`, {
            full_name: 'Test User Updated',
            role: 'manager'
        }, TOKEN);
        log('Users: Update', res, 200);
    }

    // ─── USERS : GET ALL (sans token) ───
    {
        const res = await request('GET', '/users');
        log('Users: Get All sans token (401)', res, 401);
    }

    // ─── TEAMS : CREATE ───
    {
        const res = await request('POST', '/teams', {
            name: 'Equipe Test',
            manager_id: userId
        }, TOKEN);
        log('Teams: Create', res, 201);
        if (res.body && res.body.id) teamId = res.body.id;
    }

    // ─── TEAMS : GET ALL ───
    {
        const res = await request('GET', '/teams', null, TOKEN);
        log('Teams: Get All', res, 200);
    }

    // ─── TEAMS : GET BY ID ───
    {
        const res = await request('GET', `/teams/${teamId}`, null, TOKEN);
        log('Teams: Get By Id', res, 200);
    }

    // ─── TEAMS : UPDATE ───
    {
        const res = await request('PUT', `/teams/${teamId}`, {
            name: 'Equipe Test Updated'
        }, TOKEN);
        log('Teams: Update', res, 200);
    }

    // ─── TICKET CATEGORIES : CREATE ───
    {
        const res = await request('POST', '/ticket-categories', {
            code: 'test_cat',
            label: 'Categorie Test'
        }, TOKEN);
        log('Categories: Create', res, 201);
        if (res.body && res.body.id) categoryId = res.body.id;
    }

    // ─── TICKET CATEGORIES : GET ALL ───
    {
        const res = await request('GET', '/ticket-categories', null, TOKEN);
        log('Categories: Get All', res, 200);
    }

    // ─── TICKET CATEGORIES : GET BY ID ───
    {
        const res = await request('GET', `/ticket-categories/${categoryId}`, null, TOKEN);
        log('Categories: Get By Id', res, 200);
    }

    // ─── TICKET CATEGORIES : UPDATE ───
    {
        const res = await request('PUT', `/ticket-categories/${categoryId}`, {
            label: 'Categorie Test Updated'
        }, TOKEN);
        log('Categories: Update', res, 200);
    }

    // ─── TICKET PRIORITIES : CREATE ───
    {
        const res = await request('POST', '/ticket-priorities', {
            code: 'test_pri',
            label: 'Priorite Test',
            level: 10
        }, TOKEN);
        log('Priorities: Create', res, 201);
        if (res.body && res.body.id) priorityId = res.body.id;
    }

    // ─── TICKET PRIORITIES : GET ALL ───
    {
        const res = await request('GET', '/ticket-priorities', null, TOKEN);
        log('Priorities: Get All', res, 200);
    }

    // ─── TICKET PRIORITIES : GET BY ID ───
    {
        const res = await request('GET', `/ticket-priorities/${priorityId}`, null, TOKEN);
        log('Priorities: Get By Id', res, 200);
    }

    // ─── TICKET PRIORITIES : UPDATE ───
    {
        const res = await request('PUT', `/ticket-priorities/${priorityId}`, {
            label: 'Priorite Test Updated'
        }, TOKEN);
        log('Priorities: Update', res, 200);
    }

    // ─── TICKETS : CREATE ───
    {
        const res = await request('POST', '/tickets', {
            title: 'Bug de test',
            description: 'Description du bug de test',
            category_id: categoryId,
            priority_id: priorityId
        }, TOKEN);
        log('Tickets: Create', res, 201);
        if (res.body && res.body.id) ticketId = res.body.id;
    }

    // ─── TICKETS : GET ALL ───
    {
        const res = await request('GET', '/tickets', null, TOKEN);
        log('Tickets: Get All', res, 200);
    }

    // ─── TICKETS : GET BY ID ───
    {
        const res = await request('GET', `/tickets/${ticketId}`, null, TOKEN);
        log('Tickets: Get By Id', res, 200);
    }

    // ─── TICKETS : UPDATE ───
    {
        const res = await request('PUT', `/tickets/${ticketId}`, {
            title: 'Bug de test (mis a jour)'
        }, TOKEN);
        log('Tickets: Update', res, 200);
    }

    // ─── TICKETS : ASSIGN ───
    {
        const res = await request('PATCH', `/tickets/${ticketId}/assign`, {
            assignee_id: secondUserId || userId
        }, TOKEN);
        log('Tickets: Assign', res, 200);
    }

    // ─── TICKETS : UPDATE STATUS ───
    {
        const res = await request('PATCH', `/tickets/${ticketId}/status`, {
            status: 'in_progress'
        }, TOKEN);
        log('Tickets: Update Status', res, 200);
    }

    // ─── COMMENTS : CREATE ───
    {
        const res = await request('POST', `/tickets/${ticketId}/comments`, {
            content: 'Commentaire de test',
            is_internal: false
        }, TOKEN);
        log('Comments: Create', res, 201);
        if (res.body && res.body.id) commentId = res.body.id;
    }

    // ─── COMMENTS : CREATE INTERNAL ───
    {
        const res = await request('POST', `/tickets/${ticketId}/comments`, {
            content: 'Note interne de test',
            is_internal: true
        }, TOKEN);
        log('Comments: Create Internal', res, 201);
    }

    // ─── COMMENTS : GET BY TICKET ───
    {
        const res = await request('GET', `/tickets/${ticketId}/comments`, null, TOKEN);
        log('Comments: Get By Ticket', res, 200);
    }

    // ─── COMMENTS : UPDATE ───
    {
        const res = await request('PUT', `/tickets/${ticketId}/comments/${commentId}`, {
            content: 'Commentaire mis a jour'
        }, TOKEN);
        log('Comments: Update', res, 200);
    }

    // ─── COMMENTS : DELETE ───
    {
        const res = await request('DELETE', `/tickets/${ticketId}/comments/${commentId}`, null, TOKEN);
        log('Comments: Delete', res, 200);
    }

    // ─── CLEANUP : DELETE TICKET ───
    {
        const res = await request('DELETE', `/tickets/${ticketId}`, null, TOKEN);
        log('Tickets: Delete', res, 200);
    }

    // ─── CLEANUP : DELETE CATEGORY ───
    {
        const res = await request('DELETE', `/ticket-categories/${categoryId}`, null, TOKEN);
        log('Categories: Delete', res, 200);
    }

    // ─── CLEANUP : DELETE PRIORITY ───
    {
        const res = await request('DELETE', `/ticket-priorities/${priorityId}`, null, TOKEN);
        log('Priorities: Delete', res, 200);
    }

    // ─── CLEANUP : DELETE TEAM ───
    {
        const res = await request('DELETE', `/teams/${teamId}`, null, TOKEN);
        log('Teams: Delete', res, 200);
    }

    // ─── CLEANUP : DELETE USERS ───
    if (secondUserId) {
        const res = await request('DELETE', `/users/${secondUserId}`, null, TOKEN);
        log('Users: Delete (second)', res, 200);
    }
    {
        const res = await request('DELETE', `/users/${userId}`, null, TOKEN);
        log('Users: Delete', res, 200);
    }

    printSummary();
}

function printSummary() {
    console.log('\n=== RESUME ===');
    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;
    console.log(`Total: ${results.length} | PASS: ${passed} | FAIL: ${failed}`);
    if (failed > 0) {
        console.log('\nTests en echec:');
        results.filter(r => !r.ok).forEach(r => {
            console.log(`  - ${r.name}: ${r.status} (attendu: ${r.expectedStatus})`);
        });
    }
    console.log('\n=== FIN DES TESTS ===');
}

run().catch(err => {
    console.error('Erreur fatale:', err.message);
    printSummary();
});
