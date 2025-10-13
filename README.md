# Lager Inventory Management System

A full-stack inventory management system for tracking products, customers, invoices, repairs, and returns.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: AngularJS, Bootstrap
- **Image Processing**: Sharp
- **Authentication**: Auth0
- **Deployment**: Docker, Docker Compose

## Prerequisites

### For Local Development
- Node.js 22.x or higher
- MongoDB 5.x
- npm

### For Docker Deployment
- Docker
- Docker Compose

## Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:dknoern/lager.git
cd lager
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
- AWS credentials (for SES email sending)
- AvaTax credentials (for tax calculations)
- Auth0 credentials (for authentication)
- Email addresses for notifications
- MongoDB connection string

## Running Locally

### 1. Install Dependencies

```bash
npm install
npm install -g bower
bower install
```

When prompted, choose **angular 1.4.14**.

### 2. Start MongoDB

Make sure MongoDB is running locally:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name mongo mongo:5
```

### 3. Create Uploads Directory

```bash
mkdir -p uploads
```

### 4. Start the Server

```bash
node server.js
```

The application will be available at [http://localhost:8080](http://localhost:8080)

## Running with Docker Compose

### 1. Build the Docker Image

```bash
docker build -t tryit .
```

### 2. Configure Environment

Make sure your `.env` file is configured. The MongoDB URL will be automatically overridden to use the Docker network.

### 3. Start Services

```bash
docker-compose up -d
```

This will start:
- MongoDB container (port 27017)
- Application container (port 8080)

### 4. View Logs

```bash
# View all logs
docker-compose logs -f

# View app logs only
docker-compose logs -f lager
```

### 5. Stop Services

```bash
docker-compose down
```

To also remove volumes (MongoDB data):

```bash
docker-compose down -v
```

## Production Deployment

### Using GitHub Container Registry

The GitHub Actions workflow automatically builds and pushes Docker images to `ghcr.io/dknoern/lager:latest` when you push to the `main` or `master` branch.

### On Your Production Server

1. **Login to GitHub Container Registry**:

```bash
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u dknoern --password-stdin
```

2. **Create `.env` file** with production values

3. **Pull and start containers**:

```bash
docker-compose pull
docker-compose up -d
```

4. **Update to latest version**:

```bash
docker-compose pull
docker-compose up -d
```

## Development

### Project Structure

```
lager/
├── app/                    # Frontend AngularJS modules
├── assets/                 # Static assets
├── models/                 # Mongoose data models
├── routes/                 # Express API routes
├── src/                    # Frontend source code
├── uploads/               # Uploaded images
├── config.js              # Configuration loader
├── server.js              # Express server
├── Dockerfile             # Docker build configuration
├── docker-compose.yml     # Docker Compose configuration
└── .env                   # Environment variables (not in git)
```

### Key Files

- `config.js` - Loads configuration from environment variables
- `server.js` - Main Express application
- `routes/*` - API endpoints for CRUD operations
- `models/*` - MongoDB/Mongoose schemas

## Environment Variables

See `.env.example` for all available configuration options.

Required variables:
- `AWS_ACCESS_KEY_ID` - AWS credentials for SES
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AVATAX_USERNAME` - AvaTax API username
- `AVATAX_PASSWORD` - AvaTax API password
- `AUTH0_CLIENT_ID` - Auth0 client ID
- `AUTH0_DOMAIN` - Auth0 domain

Optional variables:
- `MONGO_URL` - MongoDB connection string (default: `mongodb://localhost:27017/lager`)
- `PORT` - Server port (default: 8080)
- `EMAIL_TO` - Email addresses for notifications (comma-separated)
- `EMAIL_BCC` - BCC email addresses (comma-separated)

## Troubleshooting

### MongoDB Connection Issues

If running locally, ensure MongoDB is running:
```bash
brew services list | grep mongodb
```

If using Docker Compose, check MongoDB logs:
```bash
docker-compose logs mongo
```

### Upload Issues

Make sure the `uploads/` directory exists and has proper permissions:
```bash
mkdir -p uploads
chmod 755 uploads
```

### Build Issues

If you encounter build errors with native modules (like Sharp), try:
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

ISC

## Author

David Knoernschild
