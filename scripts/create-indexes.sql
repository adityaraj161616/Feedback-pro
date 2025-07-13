-- Connect to the 'feedbackpro' database
USE feedbackpro;

-- Create unique index on 'email' in 'users' collection
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Create unique index on 'provider' and 'providerAccountId' in 'accounts' collection
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_provider_providerAccountId ON accounts (provider, providerAccountId);

-- Create unique index on 'sessionToken' in 'sessions' collection
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_sessionToken ON sessions (sessionToken);

-- Create TTL index on 'expires' in 'sessions' collection to automatically delete expired sessions
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires) WITH EXPIRE AFTER 0;

-- Create index on 'userId' in 'forms' collection for efficient lookup of forms by user
CREATE INDEX IF NOT EXISTS idx_forms_userId ON forms (userId);

-- Create index on 'id' in 'forms' collection for efficient lookup of forms by their custom ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_forms_id ON forms (id);

-- Create index on 'formId' in 'feedback' collection for efficient lookup of feedback by form
CREATE INDEX IF NOT EXISTS idx_feedback_formId ON feedback (formId);

-- Create index on 'userId' in 'feedback' collection for efficient lookup of feedback by user owner
CREATE INDEX IF NOT EXISTS idx_feedback_userId ON feedback (userId);

-- Create index on 'createdAt' in 'feedback' collection for time-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_feedback_createdAt ON feedback (createdAt);

-- Create index on 'timestamp' in 'auditLogs' collection for time-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_auditLogs_timestamp ON auditLogs (timestamp);

-- Create index on 'action' in 'auditLogs' for filtering by action type
CREATE INDEX IF NOT EXISTS idx_auditLogs_action ON auditLogs (action);

-- Create index on 'severity' in 'auditLogs' for filtering by severity level
CREATE INDEX IF NOT EXISTS idx_auditLogs_severity ON auditLogs (severity);

-- Create index on 'userId' in 'auditLogs' for filtering by user who performed the action
CREATE INDEX IF NOT EXISTS idx_auditLogs_userId ON auditLogs (userId);

-- You can add more specific indexes based on your most common query patterns.
