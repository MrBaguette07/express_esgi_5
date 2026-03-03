-- ============================================================
-- SCHÉMA SQL – API REST Ticketing – Nexora Dynamics
-- Compatible MySQL 8+
-- ============================================================


-- ------------------------------------------------------------
-- 2. TABLES DE RÉFÉRENCE (lookup tables)
-- ticket_priorities et ticket_categories uniquement
-- Le statut est géré en VARCHAR directement dans tickets
-- ------------------------------------------------------------


CREATE TABLE ticket_priorities (
    id    INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code  VARCHAR(20) NOT NULL UNIQUE,  -- 'low', 'medium', 'high', 'critical'
    label VARCHAR(50) NOT NULL,
    level INT         NOT NULL          -- 1 = low ... 4 = critical, utile pour trier
);

INSERT INTO ticket_priorities (code, label, level) VALUES
    ('low',      'Basse',    1),
    ('medium',   'Moyenne',  2),
    ('high',     'Haute',    3),
    ('critical', 'Critique', 4);


CREATE TABLE ticket_categories (
    id    INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code  VARCHAR(20) NOT NULL UNIQUE,  -- 'bug', 'access', 'materiel', 'autre'
    label VARCHAR(50) NOT NULL
);

INSERT INTO ticket_categories (code, label) VALUES
    ('bug',      'Bug applicatif'),
    ('access',   'Demande d''accès'),
    ('materiel', 'Demande de matériel'),
    ('autre',    'Autre');



-- ------------------------------------------------------------
-- 3. ÉQUIPES
-- ------------------------------------------------------------

CREATE TABLE teams (
    id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    manager_id INT          DEFAULT NULL,  -- FK ajoutée après users
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- 4. UTILISATEURS
-- ------------------------------------------------------------

CREATE TABLE users (
    id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('collaborateur', 'support', 'manager')),
    team_id       INT          DEFAULT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_team FOREIGN KEY (team_id)
        REFERENCES teams(id) ON DELETE SET NULL
);

-- 1 seul manager par équipe : manager_id est scalaire
ALTER TABLE teams
    ADD CONSTRAINT fk_teams_manager FOREIGN KEY (manager_id)
    REFERENCES users(id) ON DELETE SET NULL;


-- ------------------------------------------------------------
-- 5. TICKETS
-- status en VARCHAR, priority et category via FK vers les tables lookup
-- ------------------------------------------------------------

CREATE TABLE tickets (
    id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,

    category_id INT          NOT NULL,
    priority_id INT          NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed', 'cancelled')),

    author_id   INT          NOT NULL,
    assignee_id INT          DEFAULT NULL,

    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tickets_category FOREIGN KEY (category_id)
        REFERENCES ticket_categories(id) ON DELETE RESTRICT,

    CONSTRAINT fk_tickets_priority FOREIGN KEY (priority_id)
        REFERENCES ticket_priorities(id) ON DELETE RESTRICT,


    CONSTRAINT fk_tickets_author   FOREIGN KEY (author_id)
        REFERENCES users(id) ON DELETE RESTRICT,

    CONSTRAINT fk_tickets_assignee FOREIGN KEY (assignee_id)
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tickets_author   ON tickets (author_id);
CREATE INDEX idx_tickets_assignee ON tickets (assignee_id);
CREATE INDEX idx_tickets_status   ON tickets (status);
CREATE INDEX idx_tickets_priority ON tickets (priority_id);
CREATE INDEX idx_tickets_category ON tickets (category_id);


-- ------------------------------------------------------------
-- 6. COMMENTAIRES
-- is_internal = TRUE → visible uniquement par le support
-- ------------------------------------------------------------

CREATE TABLE comments (
    id          INT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ticket_id   INT       NOT NULL,
    author_id   INT       NOT NULL,
    content     TEXT      NOT NULL,
    is_internal BOOLEAN   NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_ticket FOREIGN KEY (ticket_id)
        REFERENCES tickets(id) ON DELETE CASCADE,

    CONSTRAINT fk_comments_author FOREIGN KEY (author_id)
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_comments_ticket ON comments (ticket_id);