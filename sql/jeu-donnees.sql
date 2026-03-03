-- filepath: /Users/maximedp/Documents/GitHub/express_esgi_5/sql/jeu-donnees.sql
-- ============================================================
-- JEU DE DONNÉES – API REST Ticketing – Nexora Dynamics
-- ============================================================

-- ------------------------------------------------------------
-- Désactiver temporairement les FK pour l'insertion
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- ÉQUIPES (sans manager_id pour l'instant)
-- ------------------------------------------------------------
INSERT INTO teams (id, name, manager_id, created_at) VALUES
    (1, 'Équipe Infrastructure',  NULL, '2025-01-10 08:00:00'),
    (2, 'Équipe Développement',   NULL, '2025-01-10 08:05:00'),
    (3, 'Équipe Support N1',      NULL, '2025-01-10 08:10:00'),
    (4, 'Équipe Support N2',      NULL, '2025-01-10 08:15:00'),
    (5, 'Équipe RH & Opérations', NULL, '2025-01-10 08:20:00');

-- ------------------------------------------------------------
-- UTILISATEURS
-- Mots de passe hashés bcrypt correspondant à "Password123!"
-- ------------------------------------------------------------
INSERT INTO users (id, full_name, email, password, role, team_id, created_at, updated_at) VALUES
    -- Managers
    (1,  'Alice Moreau',     'alice.moreau@nexora.fr',     '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'manager',        1, '2025-01-10 08:30:00', '2025-01-10 08:30:00'),
    (2,  'Bruno Lefèvre',    'bruno.lefevre@nexora.fr',    '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'manager',        2, '2025-01-10 08:30:00', '2025-01-10 08:30:00'),
    (3,  'Camille Durand',   'camille.durand@nexora.fr',   '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'manager',        3, '2025-01-10 08:30:00', '2025-01-10 08:30:00'),
    (4,  'David Martin',     'david.martin@nexora.fr',     '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'manager',        4, '2025-01-10 08:30:00', '2025-01-10 08:30:00'),
    (5,  'Eva Rousseau',     'eva.rousseau@nexora.fr',     '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'manager',        5, '2025-01-10 08:30:00', '2025-01-10 08:30:00'),

    -- Support
    (6,  'Félix Bernard',    'felix.bernard@nexora.fr',    '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'support',        3, '2025-01-15 09:00:00', '2025-01-15 09:00:00'),
    (7,  'Gaby Petit',       'gaby.petit@nexora.fr',       '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'support',        3, '2025-01-15 09:05:00', '2025-01-15 09:05:00'),
    (8,  'Hugo Simon',       'hugo.simon@nexora.fr',       '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'support',        4, '2025-01-15 09:10:00', '2025-01-15 09:10:00'),
    (9,  'Inès Laurent',     'ines.laurent@nexora.fr',     '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'support',        4, '2025-01-15 09:15:00', '2025-01-15 09:15:00'),

    -- Collaborateurs (équipe infra)
    (10, 'Jules Roux',       'jules.roux@nexora.fr',       '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'collaborateur',  1, '2025-02-01 09:00:00', '2025-02-01 09:00:00'),
    (11, 'Lucie Garnier',    'lucie.garnier@nexora.fr',    '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'collaborateur',  1, '2025-02-01 09:05:00', '2025-02-01 09:05:00'),

    -- Collaborateurs (équipe dev)
    (12, 'Marc Fournier',    'marc.fournier@nexora.fr',    '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'collaborateur',  2, '2025-02-03 09:00:00', '2025-02-03 09:00:00'),
    (13, 'Nina Chevalier',   'nina.chevalier@nexora.fr',   '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'collaborateur',  2, '2025-02-03 09:05:00', '2025-02-03 09:05:00'),
    (14, 'Oscar Lemaire',    'oscar.lemaire@nexora.fr',    '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'collaborateur',  2, '2025-02-03 09:10:00', '2025-02-03 09:10:00'),

    -- Collaborateurs (RH & Ops)
    (15, 'Paula Mercier',    'paula.mercier@nexora.fr',    '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'collaborateur',  5, '2025-02-05 09:00:00', '2025-02-05 09:00:00'),
    (16, 'Quentin Bonnet',   'quentin.bonnet@nexora.fr',   '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'collaborateur',  5, '2025-02-05 09:05:00', '2025-02-05 09:05:00'),

    -- Collaborateur sans équipe
    (17, 'Rose Dupont',      'rose.dupont@nexora.fr',      '$2b$10$3euPIp/1p9nKpekfxHt4aOxGRJtHsB1P1q5vXo7Wq2OIFdVpCE3Gy', 'collaborateur',  NULL, '2025-02-10 10:00:00', '2025-02-10 10:00:00');

-- ------------------------------------------------------------
-- Mise à jour des managers dans les équipes
-- ------------------------------------------------------------
UPDATE teams SET manager_id = 1 WHERE id = 1;
UPDATE teams SET manager_id = 2 WHERE id = 2;
UPDATE teams SET manager_id = 3 WHERE id = 3;
UPDATE teams SET manager_id = 4 WHERE id = 4;
UPDATE teams SET manager_id = 5 WHERE id = 5;

-- ------------------------------------------------------------
-- TICKETS (variété de statuts, priorités, catégories)
-- ------------------------------------------------------------
INSERT INTO tickets (id, title, description, category_id, priority_id, status, author_id, assignee_id, created_at, updated_at) VALUES

    -- Tickets ouverts (non assignés)
    (1,  'Impossible de se connecter au VPN',
         'Depuis ce matin, je ne peux plus me connecter au VPN d''entreprise. Le client affiche une erreur de certificat.',
         2, 3, 'open', 10, NULL, '2025-02-15 08:12:00', '2025-02-15 08:12:00'),

    (2,  'Demande d''un second écran',
         'J''aurais besoin d''un second moniteur pour améliorer ma productivité lors du travail sur les environnements de déploiement.',
         3, 1, 'open', 11, NULL, '2025-02-18 10:30:00', '2025-02-18 10:30:00'),

    (3,  'Erreur 500 sur le module de facturation',
         'Une erreur 500 apparaît de manière intermittente sur /api/billing lors d''un appel POST. Logs joints.',
         1, 4, 'open', 12, NULL, '2025-02-20 14:05:00', '2025-02-20 14:05:00'),

    (4,  'Accès manquant à la base de données de staging',
         'Mon compte ne dispose pas des droits en lecture sur la base staging. Bloquant pour les tests.',
         2, 3, 'open', 13, NULL, '2025-02-21 09:00:00', '2025-02-21 09:00:00'),

    -- Tickets assignés
    (5,  'Mise à jour du firmware des switches réseau',
         'Les switches du rack B doivent être mis à jour avant la maintenance prévue le 28 février.',
         4, 2, 'assigned', 10, 8, '2025-02-10 11:00:00', '2025-02-11 09:00:00'),

    (6,  'Clavier défectueux – poste de Paula Mercier',
         'Le clavier USB du poste de Paula Mercier ne répond plus sur les touches F1 à F4.',
         3, 1, 'assigned', 15, 6, '2025-02-17 13:45:00', '2025-02-17 16:00:00'),

    (7,  'Bug d''affichage sur le tableau de bord RH',
         'Les graphiques de présence ne s''affichent pas sous Firefox 122. Le bug est reproductible à 100%.',
         1, 2, 'assigned', 16, 9, '2025-02-19 10:20:00', '2025-02-20 08:30:00'),

    -- Tickets en cours
    (8,  'Serveur de prod inaccessible – erreur SSL',
         'Le certificat SSL du serveur de production a expiré. Le site est inaccessible depuis 06h00.',
         1, 4, 'in_progress', 1,  8, '2025-02-22 06:15:00', '2025-02-22 06:45:00'),

    (9,  'Demande de compte Active Directory pour nouvel arrivant',
         'Thomas Girard arrive le 1er mars. Merci de créer son compte AD et ses accès applicatifs.',
         2, 2, 'in_progress', 5,  6, '2025-02-24 09:00:00', '2025-02-24 10:00:00'),

    (10, 'Fuite mémoire dans le service de notifications',
         'Le microservice de notifications consomme 2 Go de RAM après 48h de fonctionnement. Redémarrage nécessaire toutes les 2 jours.',
         1, 3, 'in_progress', 12, 9, '2025-02-23 15:00:00', '2025-02-24 09:00:00'),

    -- Tickets résolus
    (11, 'Imprimante hors ligne – salle de réunion A',
         'L''imprimante réseau HP de la salle A était hors ligne. Problème résolu après redémarrage du spooler.',
         3, 1, 'resolved', 15, 7, '2025-01-20 14:00:00', '2025-01-20 16:30:00'),

    (12, 'Accès refusé à l''outil de déploiement CI/CD',
         'Mon token GitLab avait expiré. Le support a régénéré les accès. Tout fonctionne.',
         2, 2, 'resolved', 13, 6, '2025-01-25 10:00:00', '2025-01-25 15:00:00'),

    (13, 'Crash de l''application mobile iOS v2.3.1',
         'Un crash survenant au démarrage sur iOS 17.2 a été identifié et corrigé dans le patch v2.3.2.',
         1, 4, 'resolved', 14, 8, '2025-02-05 08:00:00', '2025-02-07 17:00:00'),

    -- Tickets fermés
    (14, 'Réinitialisation mot de passe oublié',
         'Demande de réinitialisation de mot de passe traitée et confirmée par l''utilisateur.',
         2, 1, 'closed', 16, 7, '2025-01-15 11:00:00', '2025-01-15 11:45:00'),

    (15, 'Commande de casque audio pour le télétravail',
         'Commande validée, livrée et matériel reçu par l''utilisateur.',
         3, 1, 'closed', 11, 6, '2025-01-18 09:00:00', '2025-01-28 14:00:00'),

    -- Ticket annulé
    (16, 'Migration vers un nouvel outil de ticketing',
         'Demande annulée suite à la décision de conserver le système actuel.',
         4, 2, 'cancelled', 5, NULL, '2025-01-30 10:00:00', '2025-02-03 09:00:00');

-- ------------------------------------------------------------
-- COMMENTAIRES
-- ------------------------------------------------------------
INSERT INTO comments (id, ticket_id, author_id, content, is_internal, created_at) VALUES

    -- Ticket 1 – VPN
    (1,  1, 6,  'Bonjour, pouvez-vous préciser votre OS et la version du client VPN utilisé ?', FALSE, '2025-02-15 09:00:00'),
    (2,  1, 10, 'Windows 11 Pro, client GlobalProtect v6.1.2. L''erreur est : "SSL handshake failed".',    FALSE, '2025-02-15 09:30:00'),
    (3,  1, 6,  'Note interne : vérifier le renouvellement du certificat racine sur le serveur Palo Alto.', TRUE,  '2025-02-15 09:35:00'),

    -- Ticket 3 – Erreur 500 facturation
    (4,  3, 9,  'Pouvez-vous fournir un exemple de payload qui déclenche l''erreur ?',           FALSE, '2025-02-20 14:30:00'),
    (5,  3, 12, 'Voici un exemple : {"invoice_id": 9823, "amount": 0}. L''erreur arrive à chaque fois.', FALSE, '2025-02-20 15:00:00'),
    (6,  3, 9,  'Note interne : probablement une division par zéro côté calcul de TVA. À confirmer avec l''équipe dev.', TRUE, '2025-02-20 15:05:00'),

    -- Ticket 5 – Firmware switches
    (7,  5, 8,  'J''ai commencé l''inventaire des switches concernés. 6 équipements à mettre à jour.', FALSE, '2025-02-11 10:00:00'),
    (8,  5, 1,  'Merci Hugo. Prévoir une fenêtre de maintenance samedi 22 entre 22h et 00h.',             FALSE, '2025-02-11 11:00:00'),

    -- Ticket 8 – SSL prod (critique, en cours)
    (9,  8, 8,  'J''ai identifié le certificat concerné. Renouvellement en cours via Let''s Encrypt.',     FALSE, '2025-02-22 06:50:00'),
    (10, 8, 1,  'OK, tenez-moi informé toutes les 30 minutes. L''astreinte est mobilisée.',               FALSE, '2025-02-22 07:00:00'),
    (11, 8, 8,  'Note interne : l''auto-renouvellement certbot avait été désactivé lors de la migration serveur du 15/02.', TRUE, '2025-02-22 07:05:00'),
    (12, 8, 8,  'Certificat renouvelé, en attente de propagation DNS (~15 min).',                          FALSE, '2025-02-22 07:30:00'),

    -- Ticket 10 – Fuite mémoire
    (13, 10, 12, 'J''ai reproduit le problème en local. Le listener d''événements n''est jamais détaché.', FALSE, '2025-02-23 16:00:00'),
    (14, 10, 9,  'Note interne : priorité haute, risque d''impact en prod sous 48h.',                       TRUE,  '2025-02-23 16:05:00'),
    (15, 10, 12, 'PR ouverte avec le fix, en attente de review.',                                           FALSE, '2025-02-24 11:00:00'),

    -- Ticket 11 – Imprimante (résolu)
    (16, 11, 7,  'Redémarrage du service Print Spooler effectué. L''imprimante est de nouveau en ligne.',  FALSE, '2025-01-20 16:30:00'),
    (17, 11, 15, 'Parfait, merci pour la rapidité !',                                                       FALSE, '2025-01-20 16:45:00'),

    -- Ticket 13 – Crash iOS (résolu)
    (18, 13, 8,  'Bug identifié : un appel réseau synchrone bloquait le thread principal au démarrage.',   FALSE, '2025-02-06 10:00:00'),
    (19, 13, 14, 'Patch v2.3.2 déployé sur l''App Store, crash corrigé. Ticket résolu.',                   FALSE, '2025-02-07 17:00:00'),

    -- Ticket 16 – Annulé
    (20, 16, 5,  'Après évaluation, la migration est reportée à l''année prochaine. Ticket annulé.',       FALSE, '2025-02-03 09:00:00');

-- ------------------------------------------------------------
-- Réactiver les FK
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;
