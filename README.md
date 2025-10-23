# Gestão de Clínica Veterinária - UniSOVET

Este projeto é um sistema de gestão para clínicas veterinárias, permitindo o gerenciamento de consultas, clientes, pets e inventário, incluindo previsão de estoque e vendas utilizando um modelo estatístico baseado na biblioteca **Statsmodels**.

---

## 🧰 Pré-requisitos

Antes de começar, você precisará ter as seguintes ferramentas instaladas em sua máquina:

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)  
- [Python](https://www.python.org/downloads/) (versão 3.8 ou superior)  
- [Pip](https://pip.pypa.io/en/stable/installation/) (gerenciador de pacotes do Python)  

---

## 🗂️ Estrutura do Projeto

```
.
├── backend/                 # Código do backend (API)
│   ├── routers/             # Rotas da API
│   ├── schemas.py           # Schemas de dados
│   ├── models.py            # Modelos de banco de dados
│   ├── crud.py              # Operações CRUD
│   ├── main.py              # Inicialização do servidor
│   ├── requirements.txt     # Dependências Python (incluindo statsmodels)
│   └── model_prediction.py  # Modelo de previsão de estoque/vendas
├── components/              # Componentes React do frontend
├── hooks/                   # Hooks customizados do React
├── index.html               # Página principal
├── package.json             # Configuração do frontend
├── tsconfig.json            # Configuração TypeScript
└── README.md                # Este arquivo
```

---

## 🚀 Como Executar o Projeto

### 1. Backend (API)

O backend é responsável por toda a lógica de negócio, comunicação com o banco de dados e previsão de estoque/vendas.

```bash
# Navegue até o diretório do backend
cd backend

# Crie e ative um ambiente virtual (opcional, mas recomendado)
python -m venv venv
source venv/bin/activate  # No Windows, use: venv\Scripts\activate

# Instale as dependências do Python
pip install -r requirements.txt

# Inicie o servidor da API
uvicorn main:app --reload
```

O servidor estará em execução em:  
👉 `http://127.0.0.1:8000`

---

### 2. Frontend (Interface do Usuário)

O frontend é a interface com a qual o usuário interage.

```bash
# Abra um novo terminal na raiz do projeto

# Instale as dependências do Node.js
npm install

# Execute a aplicação frontend
npm run dev
```

A aplicação estará acessível em:  
👉 `http://localhost:3000/`

---

## 🧠 Previsão de Estoque e Vendas (IA)

O sistema utiliza **Statsmodels** para gerar previsões de demanda e sugerir reposição de estoque de forma automática.

- O modelo analisa o histórico de vendas armazenado no banco de dados.  
- Gera previsões de vendas futuras com base em séries temporais.  
- Sugere níveis ideais de reposição de produtos.  

O endpoint de previsão está implementado em `backend/routers/forecast.py`, utilizando o modelo estatístico definido em `model_prediction.py`.

---

## 🧩 Tecnologias Utilizadas

### Frontend
- React  
- Vite  
- TypeScript  
- Recharts (visualização de gráficos)  

### Backend
- FastAPI  
- Python  
- SQLAlchemy  
- Uvicorn  
- **Statsmodels** (modelo estatístico de previsão de estoque e vendas)
