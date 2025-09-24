# Expenses Frontend - B2B Web Application

A React-based single-page application that simulates a B2B expense management platform for the DevOps training lab. This frontend demonstrates modern web application deployment and configuration management patterns.

## Service Role in Training Lab

This frontend service simulates a B2B web application and demonstrates:

- **Single Page Application**: React-based SPA with client-side routing
- **Authentication Flow**: JWT token management and session handling
- **API Integration**: RESTful API consumption with error handling
- **File Management**: Upload and download capabilities for document attachments
- **Responsive Design**: Modern UI/UX patterns for business applications
- **Runtime Configuration**: Environment-agnostic deployment with runtime API configuration

## DevOps Learning Objectives

- **Static Asset Deployment**: Learn to serve React applications in containers
- **Runtime Configuration**: Understand configuration injection without rebuilding
- **Multi-stage Builds**: Optimize Docker images for production deployment
- **CDN Integration**: Configure for content delivery networks and caching
- **Environment Promotion**: Deploy same build across multiple environments

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd packages/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm start
```

The application will start on port 3030 and automatically open in your browser at `http://localhost:3030`.

## Building for Production

To create a production build:

```bash
npm run build
```

This creates a `build` folder with optimized static files ready for deployment.

## Deployment

### Web Server Deployment

1. **Apache/Nginx**: Copy the `build` folder contents to your web server's document root:
   ```bash
   cp -r build/* /var/www/html/
   ```

2. **Configure server for SPA**: Add URL rewriting to serve `index.html` for all routes:
   
   **Apache (.htaccess)**:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```
   
   **Nginx**:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

### AWS S3 + CloudFront Deployment

1. **Upload to S3**:
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

2. **S3 Bucket Configuration**:
   - Enable static website hosting
   - Set index document: `index.html`
   - Set error document: `index.html` (for SPA routing)

3. **CloudFront Configuration**:
   - Create distribution with S3 as origin
   - Configure custom error pages: 403/404 → `/index.html` (200 status)
   - Set cache behaviors for static assets

4. **Runtime Configuration**: After deployment, update `config.js` with your API URL:
   ```javascript
   window.APP_CONFIG = {
     API_BASE_URL: 'https://your-api-domain.com'
   };
   ```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test -- --watch
```

The tests cover:
- Component rendering
- User interactions
- API integration
- Modal functionality

## Environment Variables

The application uses the following configuration:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | Development server port | 3030 |

## Backend URL Configuration

### Build Time Configuration

**Development (default):**
```bash
npm start
```
Uses `http://localhost:3000` from `public/config.js`

**Custom build-time URL:**
1. Edit `public/config.js` before building:
   ```javascript
   window.APP_CONFIG = {
     API_BASE_URL: 'https://your-api-domain.com'
   };
   ```
2. Build the application:
   ```bash
   npm run build
   ```

### Runtime Configuration (Recommended)

Build once, configure anywhere by modifying the config file after deployment:

1. **Build with default settings:**
   ```bash
   npm run build
   ```

2. **Deploy and configure per environment:**
   
   **Development/Local:**
   ```javascript
   // build/config.js
   window.APP_CONFIG = {
     API_BASE_URL: 'http://localhost:3000'
   };
   ```
   
   **Staging:**
   ```javascript
   // build/config.js
   window.APP_CONFIG = {
     API_BASE_URL: 'https://staging-api.example.com'
   };
   ```
   
   **Production:**
   ```javascript
   // build/config.js
   window.APP_CONFIG = {
     API_BASE_URL: 'https://api.example.com'
   };
   ```

### Automated Deployment Configuration

**Docker/Container deployment:**
```bash
# Replace API URL in container
sed -i "s|http://localhost:3000|$API_BASE_URL|g" /app/config.js
```

**CI/CD Pipeline:**
```bash
# Build once
npm run build

# Configure for each environment
echo "window.APP_CONFIG = { API_BASE_URL: '$API_BASE_URL' };" > build/config.js
```

## API Integration

## Lab Exercise Notes

**For Docker**: Students should use multi-stage builds (build stage + nginx serving stage) and configure API URLs via environment injection.
**For Kubernetes**: Deploy as static assets with ConfigMap-based configuration and ingress controllers.
**For CI/CD**: Build once, deploy everywhere with environment-specific configuration injection.

## Authentication

The application requires user authentication to access expense data. Default credentials:
- **Username**: admin, **Password**: admin123
- **Username**: user, **Password**: user123

Tokens are stored in localStorage and automatically included in API requests. The application will redirect to login if the token expires.

### API Endpoints Used

- `GET /api/expenses` - Fetch all expenses
- `POST /api/expenses` - Create new expense (with file upload)
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense (with file upload)
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/download/:filename` - Download attachment file

## File Structure

```
src/
├── App.js          # Main application component
├── App.css         # Application styles
├── index.js        # Application entry point
└── index.css       # Global styles
```

## Usage

1. **Login**: Enter username and password to authenticate
2. **Adding Expenses**: Fill out the form including exported checkbox and click "Add Expense"
3. **Viewing Details**: Click "View" button in the Actions column to open the modal
4. **Editing**: In the modal, click "Edit" to modify expense details including exported status
5. **Downloading**: Click "Download" in the modal to get the attachment file
6. **Deleting**: Click "Delete" button in the Actions column (requires confirmation)
7. **Export Tracking**: View exported status in table and manage via modal edit mode
8. **Logout**: Click "Logout" button to end session

## Modal Features

- **View Mode**: Display all expense details including exported status in a clean, readable format
- **Edit Mode**: Inline editing with form validation, file upload, and exported checkbox
- **File Management**: Upload new attachments and download existing ones
- **Export Management**: View and modify exported status for data lake integration
- **Responsive Design**: Works on desktop and mobile devices

## Dependencies

- **React 19.1.1** - UI framework
- **axios 1.12.2** - HTTP client for API requests
- **react-scripts 5.0.1** - Build and development tools