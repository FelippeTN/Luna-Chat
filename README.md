# Luna-Chat 🐶

A modern AI-powered chat application built with Django and powered by Groq's LLaMA models. Luna-Chat provides an intuitive interface for real-time conversations with AI, featuring user authentication, conversation management, and streaming responses.

## 🚀 Features

- **Real-time AI Chat**: Powered by Groq's LLaMA-3.3-70b-versatile model
- **Streaming Responses**: Get AI responses in real-time as they're generated
- **User Authentication**: Secure login and registration system
- **Conversation Management**: Save, view, and delete chat histories
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Docker Support**: Easy deployment with Docker Compose
- **API Documentation**: Swagger/OpenAPI documentation included

## 🛠️ Tech Stack

- **Backend**: Django 5.2.3 + Django REST Framework
- **Database**: PostgreSQL
- **AI Model**: Groq LLaMA-3.3-70b-versatile
- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Containerization**: Docker & Docker Compose
- **Database Admin**: pgAdmin4

## 📋 Prerequisites

Before running the project, make sure you have:

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- A [Groq API key](https://console.groq.com/) (free tier available)

## 🐳 Quick Start with Docker

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd TNs-Chat
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Groq API key:

```env
GROQ_KEY="your_groq_api_key_here"
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

This command will:
- Build the Django application
- Set up PostgreSQL database
- Configure pgAdmin for database management
- Set up Tailwind CSS compilation
- Start all services

### 4. Access the Application

Once all containers are running:

- **Main Application**: http://localhost:8000
- **API Documentation**: http://localhost:8000/swagger/
- **pgAdmin**: http://localhost:5050
  - Email: `admin@admin.com`
  - Password: `admin`

## 🔧 Services Overview

The Docker Compose setup includes:

### Web Application (`web`)
- **Port**: 8000
- **Description**: Main Django application
- **Auto-migrations**: Runs database migrations on startup

### Database (`db`)
- **Port**: 5432
- **Engine**: PostgreSQL 15 Alpine
- **Database**: `LunaChat`
- **Credentials**: `postgres/1234`

### Database Admin (`pgadmin`)
- **Port**: 5050
- **Interface**: pgAdmin4 web interface
- **Default credentials**: `admin@admin.com` / `admin`

### CSS Compiler (`tailwind`)
- **Description**: Watches and compiles Tailwind CSS
- **Input**: `./static/css/main.css`
- **Output**: `./static/css/tailwind/output.css`

## 📚 API Endpoints

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/llm-response/` | Send prompt and get AI response |
| POST | `/api/llm-response-stream/` | Send prompt and get streaming AI response |
| GET | `/api/get-chats/` | Retrieve user's chat history |
| DELETE | `/api/delete-chat/<uuid:chat_id>/` | Delete a specific conversation |

### Authentication Required

All API endpoints require user authentication via Django's session or token authentication.

### Example API Usage

```python
import requests

# Login first to get session
session = requests.Session()
login_data = {
    'username': 'your_username',
    'password': 'your_password'
}
session.post('http://localhost:8000/login/', data=login_data)

# Send a chat message
chat_data = {
    'prompt': 'Hello, Luna!',
    'max_tokens': 2048,
    'temperature': 0.7
}
response = session.post('http://localhost:8000/api/llm-response/', json=chat_data)
print(response.json())
```

## 🎨 User Interface

The application features a modern, dark-themed interface with:

- **Welcome Page**: Landing page with feature highlights
- **Authentication Pages**: Login and registration forms
- **Chat Interface**: Real-time chat with AI assistant
- **Sidebar Navigation**: Easy access to conversation history
- **Responsive Design**: Works on desktop and mobile devices

## 🔧 Development Setup

### Without Docker (Local Development)

1. **Install Python Dependencies**
```bash
pip install -r requirements.txt
```

2. **Set Up Database**
```bash
# Make sure PostgreSQL is running locally
python manage.py migrate
```

3. **Install Node Dependencies**
```bash
npm install
```

4. **Compile CSS**
```bash
npm run build
# or for watch mode
npm run watch
```

5. **Run Development Server**
```bash
python manage.py runserver
```

## 📁 Project Structure

```
TNs-Chat/
├── api/                    # Django API app
│   ├── api/               # API views and serializers
│   ├── models.py          # Database models
│   └── urls.py            # API URL patterns
├── pages/                 # Django pages app
│   ├── views.py           # Page views
│   └── urls.py            # Page URL patterns
├── templates/             # HTML templates
│   ├── chat_views/        # Chat interface templates
│   └── register_views/    # Auth templates
├── static/                # Static files
│   ├── css/               # Stylesheets
│   └── js/                # JavaScript files
├── django_setup/          # Django project settings
├── docker-compose.yml     # Docker services configuration
├── Dockerfile            # Django app container
└── requirements.txt       # Python dependencies
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_KEY` | Groq API key for AI model access | Required |
| `POSTGRES_DB` | PostgreSQL database name | `LunaChat` |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `1234` |
| `POSTGRES_HOST` | PostgreSQL host | `db` (Docker) / `localhost` |

## 🧪 Testing

Run tests with:

```bash
# Inside Docker container
docker-compose exec web python manage.py test

# Local development
python manage.py test
```

## 📖 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/
- **JSON Schema**: http://localhost:8000/swagger.json/

## 🔍 Troubleshooting

### Common Issues

1. **Groq API Key Error**
   - Ensure your Groq API key is correctly set in the `.env` file
   - Verify the key is valid and has sufficient credits

2. **Database Connection Issues**
   - Check if PostgreSQL container is running: `docker-compose ps`
   - Verify database credentials in docker-compose.yml

3. **CSS Not Loading**
   - Ensure Tailwind container is running and compiling CSS
   - Check if `static/css/tailwind/output.css` exists

4. **Port Already in Use**
   - Change ports in docker-compose.yml if 8000, 5432, or 5050 are occupied

### Container Logs

Check logs for debugging:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs web
docker-compose logs db
docker-compose logs tailwind
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Felippe Toscano Nalim**

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for providing fast AI inference
- [Django](https://djangoproject.com/) for the robust web framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

**Note**: This project uses Groq's API for AI responses. Make sure to review Groq's terms of service and usage limits when deploying to production.
