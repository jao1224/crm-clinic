CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    address VARCHAR(255),
    medical_history TEXT,
    cpf VARCHAR(14) UNIQUE NOT NULL
);

CREATE TABLE dentists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    experience VARCHAR(50),
    patients INT,
    specializations TEXT[]
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    dentist_id INT REFERENCES dentists(id),
    service_id INT REFERENCES services(id_servico),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    type VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
);

CREATE TABLE finances (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL
);

-- Tabela para armazenar os serviços oferecidos pela clínica
CREATE TABLE services (
    id_servico SERIAL PRIMARY KEY,
    nome_servico VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor_aproximado DECIMAL(10, 2) NOT NULL,
    duracao_media_min INT NOT NULL,
    palavras_chave TEXT[],
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dentist_schedules (
    id SERIAL PRIMARY KEY,
    dentist_id INT REFERENCES dentists(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL, -- Ex: 'Monday', 'Tuesday'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    UNIQUE (dentist_id, day_of_week, start_time, end_time)
);

CREATE TABLE chatbot_sessions (
    session_id VARCHAR(255) PRIMARY KEY, -- Chave primária, ID da execução do n8n
    user_identifier VARCHAR(255) NOT NULL, -- Identificador do usuário, como o telefone
    current_agent VARCHAR(50) NOT NULL DEFAULT 'Porteiro', -- Agente atual, começa com 'Porteiro'
    current_status VARCHAR(50), -- Último estado da conversa
    collected_data JSONB, -- Dados coletados em formato JSON
    conversation_history JSONB, -- Histórico da conversa em formato JSON
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Sessão ativa por padrão
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Data de criação
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Data da última atualização
);

-- Criar um índice no identificador do usuário para buscas rápidas
CREATE INDEX idx_user_identifier ON chatbot_sessions (user_identifier);

-- Mock Data

INSERT INTO services (nome_servico, descricao, valor_aproximado, duracao_media_min, palavras_chave) VALUES
('Consulta de Rotina', 'Check-up geral e avaliação da saúde bucal.', 150.00, 30, ARRAY['checkup', 'avaliação', 'rotina']),
('Limpeza Dental Profissional', 'Remoção de placa bacteriana e tártaro.', 200.00, 45, ARRAY['limpeza', 'profilaxia', 'tártaro']);

INSERT INTO patients (name, email, phone, date_of_birth, address, medical_history, cpf) VALUES
('Sarah Johnson', 'sarah.j@email.com', '(555) 123-4567', '1990-05-15', '123 Main St, City, State', 'Peanut allergy', '111.111.111-11'),
('Michael Chen', 'm.chen@email.com', '(555) 234-5678', '1985-08-20', '456 Oak Ave, City, State', NULL, '222.222.222-22');

INSERT INTO dentists (name, specialty, email, phone, experience, patients, specializations) VALUES
('Dr. Emily Smith', 'Odontologia Geral', 'e.smith@dentalcare.com', '(555) 111-2222', '15 anos', 342, ARRAY['Canal', 'Coroas', 'Cuidados Preventivos']),
('Dr. Michael Brown', 'Ortodontia', 'm.brown@dentalcare.com', '(555) 222-3333', '12 anos', 289, ARRAY['Aparelhos', 'Invisalign', 'Alinhamento de Mandíbula']);

INSERT INTO dentist_schedules (dentist_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES
(1, 'Monday', '09:00:00', '17:00:00', 30),
(1, 'Wednesday', '09:00:00', '17:00:00', 30),
(1, 'Friday', '09:00:00', '17:00:00', 30),
(2, 'Tuesday', '10:00:00', '18:00:00', 60),
(2, 'Thursday', '10:00:00', '18:00:00', 60);

INSERT INTO appointments (patient_id, dentist_id, start_time, end_time, type, notes, status) VALUES
(1, 1, '2024-10-02 09:00:00', '2024-10-02 09:30:00', 'Checkup', NULL, 'confirmed'),
(2, 2, '2024-10-02 10:30:00', '2024-10-02 11:30:00', 'Cleaning', NULL, 'confirmed');
