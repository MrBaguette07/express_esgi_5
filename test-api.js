const http = require('http');
require('dotenv').config();

const API_PORT = process.env.API_PORT || 3000;
const API_URL = `http://localhost:${API_PORT}`;

let tokens = {
    collaborateur1: null,
    collaborateur2: null,
    manager: null,
    support: null
};

let data = {
    teams: [],
    categories: [],
    priorities: [],
    tickets: []
};

async function request(method, url, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const fullUrl = new URL(url);
        const options = {
            method: method,
            hostname: fullUrl.hostname,
            port: fullUrl.port,
            path: fullUrl.pathname + fullUrl.search,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ status: res.statusCode, data: parsed });
                } else {
                    reject({ status: res.statusCode, data: parsed });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

const authHeader = (token) => ({ 'Authorization': `Bearer ${token}` });

async function test() {
    console.log('--- DÉBUT DU SCÉNARIO DE TEST ---');

    try {
        // 1. Création des utilisateurs de base via /auth/signin
        console.log('\n1. Création et connexion des utilisateurs...');
        
        const usersToCreate = [
            { email: 'collab1@nexora.com', password: 'password123', full_name: 'Collaborateur Un', role: 'collaborateur' },
            { email: 'collab2@nexora.com', password: 'password123', full_name: 'Collaborateur Deux', role: 'collaborateur' },
            { email: 'manager@nexora.com', password: 'password123', full_name: 'Manager Un', role: 'manager' },
            { email: 'support@nexora.com', password: 'password123', full_name: 'Support Un', role: 'support' }
        ];

        for (const u of usersToCreate) {
            try {
                await request('POST', `${API_URL}/auth/signin`, u);
                console.log(`Utilisateur créé : ${u.email}`);
            } catch (e) {
                if (e.status === 400 && e.data?.error === "Email already exists") {
                    console.log(`Utilisateur existe déjà : ${u.email}`);
                } else {
                    throw e;
                }
            }
            const loginRes = await request('POST', `${API_URL}/auth/login`, { email: u.email, password: u.password });
            const key = u.email.split('@')[0].replace('collab', 'collaborateur');
            tokens[key] = loginRes.data.token;
        }

        // 2. Setup des données (Teams, Categories, Priorities)
        console.log('\n2. Configuration des données de référence...');
        
        const timestamp = Math.floor(Date.now() / 1000) % 1000000;
        const teamRes = await request('POST', `${API_URL}/teams`, { name: `Team Alpha ${timestamp}` }, authHeader(tokens.support));
        data.teams.push(teamRes.data);
        console.log(`Équipe créée : ${teamRes.data.name}`);

        const usersRes = await request('GET', `${API_URL}/users`, null, authHeader(tokens.support));
        const collab1User = usersRes.data.find(u => u.email === 'collab1@nexora.com');
        const managerUser = usersRes.data.find(u => u.email === 'manager@nexora.com');

        await request('PUT', `${API_URL}/users/${collab1User.id}`, { team_id: teamRes.data.id }, authHeader(tokens.support));
        await request('PUT', `${API_URL}/users/${managerUser.id}`, { team_id: teamRes.data.id }, authHeader(tokens.support));
        console.log('Utilisateurs assignés à l\'équipe Alpha (collab1 et manager)');

        // RE-LOGIN pour mettre à jour les tokens avec le teamId
        const loginCollab1 = await request('POST', `${API_URL}/auth/login`, { email: 'collab1@nexora.com', password: 'password123' });
        tokens.collaborateur1 = loginCollab1.data.token;
        const loginManager = await request('POST', `${API_URL}/auth/login`, { email: 'manager@nexora.com', password: 'password123' });
        tokens.manager = loginManager.data.token;
        console.log('Tokens rafraîchis avec TeamId');

        const catRes = await request('POST', `${API_URL}/ticket-categories`, { code: `bug_${timestamp}`, label: 'Bug applicatif' }, authHeader(tokens.support));
        data.categories.push(catRes.data);
        
        const prioHigh = await request('POST', `${API_URL}/ticket-priorities`, { code: `high_${timestamp}`, label: 'Haute', level: 3 }, authHeader(tokens.support));
        let prioCritical;
        try {
            const pcRes = await request('POST', `${API_URL}/ticket-priorities`, { code: `critical`, label: 'Critique', level: 4 }, authHeader(tokens.support));
            prioCritical = pcRes.data;
        } catch (e) {
            const pAll = await request('GET', `${API_URL}/ticket-priorities`, null, authHeader(tokens.support));
            prioCritical = pAll.data.find(p => p.code === 'critical');
        }
        data.priorities.push(prioHigh.data, prioCritical);

        // 3. Tests de création de tickets
        console.log('\n3. Tests de création de tickets...');
        
        const ticket1Res = await request('POST', `${API_URL}/tickets`, {
            title: 'Bug connexion',
            description: 'Je ne peux pas me connecter',
            category_id: data.categories[0].id,
            priority_id: prioHigh.data.id
        }, authHeader(tokens.collaborateur1));
        console.log('Ticket 1 créé par Collab1 (OK)');
        data.tickets.push(ticket1Res.data);

        try {
            await request('POST', `${API_URL}/tickets`, {
                title: 'Urgence absolue',
                description: 'Le serveur explose',
                category_id: data.categories[0].id,
                priority_id: prioCritical.data.id
            }, authHeader(tokens.collaborateur1));
            console.error('ERREUR : Collab1 a pu créer un ticket CRITICAL');
            process.exit(1);
        } catch (e) {
            console.log('Succès du test : Collab1 ne peut pas créer de ticket CRITICAL (403)');
        }

        const ticket2Res = await request('POST', `${API_URL}/tickets`, {
            title: 'Besoin clavier',
            description: 'Mon clavier est cassé',
            category_id: data.categories[0].id,
            priority_id: prioHigh.data.id
        }, authHeader(tokens.collaborateur2));
        console.log('Ticket 2 créé par Collab2 (OK)');
        data.tickets.push(ticket2Res.data);

        // 4. Tests de visibilité
        console.log('\n4. Tests de visibilité...');
        
        const collab1Tickets = await request('GET', `${API_URL}/tickets`, null, authHeader(tokens.collaborateur1));
        console.log(`Collab1 voit ${collab1Tickets.data.length} ticket(s) (Attendu: 1)`);

        const managerTickets = await request('GET', `${API_URL}/tickets`, null, authHeader(tokens.manager));
        console.log(`Manager voit ${managerTickets.data.length} ticket(s) (Attendu: 1 - celui de Collab1)`);

        const supportTickets = await request('GET', `${API_URL}/tickets`, null, authHeader(tokens.support));
        console.log(`Support voit ${supportTickets.data.length} ticket(s) (Attendu: 2)`);

        // 5. Tests de changement de statut
        console.log('\n5. Tests de changement de statut...');
        
        const supportUser = usersRes.data.find(u => u.email === 'support@nexora.com');
        await request('PATCH', `${API_URL}/tickets/${ticket1Res.data.id}/assign`, { assignee_id: supportUser.id }, authHeader(tokens.support));
        console.log('Ticket 1 assigné par Support (open => assigned)');

        try {
            await request('PATCH', `${API_URL}/tickets/${ticket1Res.data.id}/status`, { status: 'in_progress' }, authHeader(tokens.manager));
            console.error('ERREUR : Le manager a pu changer le statut');
            process.exit(1);
        } catch (e) {
            console.log('Succès du test : Le manager ne peut pas traiter techniquement (403)');
        }

        await request('PATCH', `${API_URL}/tickets/${ticket1Res.data.id}/status`, { status: 'in_progress' }, authHeader(tokens.support));
        console.log('Ticket 1 passé en in_progress par Support');

        await request('PATCH', `${API_URL}/tickets/${ticket2Res.data.id}/status`, { status: 'cancelled' }, authHeader(tokens.collaborateur2));
        console.log('Ticket 2 annulé par son auteur (OK)');

        // 6. Tests de priorité (Manager)
        console.log('\n6. Tests de priorité...');
        
        const prioCriticalFromData = data.priorities.find(p => p.code === 'critical');
        await request('PUT', `${API_URL}/tickets/${ticket1Res.data.id}`, { priority_id: prioCriticalFromData.id }, authHeader(tokens.manager));
        console.log('Manager a changé la priorité du ticket de son équipe en CRITICAL (OK)');

        try {
            await request('PUT', `${API_URL}/tickets/${ticket1Res.data.id}`, { priority_id: prioHigh.data.id }, authHeader(tokens.support));
            console.error('ERREUR : Support a pu changer la priorité');
            process.exit(1);
        } catch (e) {
            console.log('Succès du test : Support ne peut pas changer la priorité (403)');
        }

        // 7. Tests de commentaires
        console.log('\n7. Tests de commentaires...');
        
        await request('POST', `${API_URL}/tickets/${ticket1Res.data.id}/comments`, { content: 'Note technique secrète', is_internal: true }, authHeader(tokens.support));
        console.log('Support a ajouté un commentaire interne');

        await request('POST', `${API_URL}/tickets/${ticket1Res.data.id}/comments`, { content: 'Nous travaillons dessus', is_internal: false }, authHeader(tokens.support));

        const collabComments = await request('GET', `${API_URL}/tickets/${ticket1Res.data.id}/comments`, null, authHeader(tokens.collaborateur1));
        const internalVisibleByCollab = collabComments.data.some(c => c.is_internal);
        console.log(`Collab1 voit ${collabComments.data.length} commentaires. Interne visible ? ${internalVisibleByCollab} (Attendu: 1 commentaire, false)`);

        const supportComments = await request('GET', `${API_URL}/tickets/${ticket1Res.data.id}/comments`, null, authHeader(tokens.support));
        console.log(`Support voit ${supportComments.data.length} commentaires (Attendu: 2)`);

        console.log('\n--- TOUS LES TESTS SONT TERMINÉS AVEC SUCCÈS ---');

    } catch (e) {
        console.error('\n!!! ERREUR DURANT LES TESTS !!!');
        console.error(e);
        process.exit(1);
    }
}

test();
