# Vercel Deployment Guide

This guide walks through the process of deploying the Token Transaction Analyzer API to Vercel.

## Prerequisites

1. **Vercel Account**
   - Create an account at [vercel.com](https://vercel.com) if you don't have one

2. **Vercel CLI**
   - Install via npm: `npm install -g vercel`

3. **Git Repository**
   - Create a repository with your project files

## Project Structure

Ensure your project follows this structure:

```
token-analyzer/
├── api/
│   └── analyze.py         # Main API handler 
├── vercel.json            # Vercel configuration
├── requirements.txt       # Python dependencies
├── README.md              # Documentation
└── frontend/              # (Optional) Frontend files
```

## Setup Steps

### 1. Create Project Files

Clone the project repository and navigate to it:

```bash
git clone <your-repository-url>
cd token-analyzer
```

### 2. Configure Vercel

Login to Vercel from the CLI:

```bash
vercel login
```

### 3. Link Project to Vercel

From within your project directory:

```bash
vercel link
```

Follow the prompts to link your project to your Vercel account.

### 4. Configure Environment Variables (if needed)

If you need environment variables:

```bash
vercel env add VARIABLE_NAME
```

### 5. Test Locally

Test your serverless functions locally:

```bash
vercel dev
```

This will start a local server, usually at http://localhost:3000. You can test your API endpoint at http://localhost:3000/api/analyze.

### 6. Deploy to Vercel

When ready to deploy:

```bash
vercel --prod
```

This will deploy your project to Vercel's production environment.

## Troubleshooting Deployment

### Common Issues and Solutions

1. **Python Version Issues**
   - Ensure your `vercel.json` specifies the correct Python runtime version
   - Vercel supports Python 3.9 by default

2. **Package Installation Failures**
   - Check your `requirements.txt` for compatibility issues
   - Ensure all packages are compatible with Python 3.9

3. **Serverless Function Timeout**
   - Large CSV processing might exceed default timeouts
   - Consider optimizing code or limiting input file size

4. **Memory Limits**
   - Default Vercel function memory is 1024MB
   - For large CSV files, optimize memory usage in pandas operations

5. **API Request Size Limitations**
   - Vercel has a default payload size limit (around 4.5MB)
   - Consider implementing client-side chunking for large files

## Monitoring

After deployment, monitor your API performance and errors:

1. Visit your Vercel Dashboard at https://vercel.com/dashboard
2. Select your project
3. Navigate to the "Functions" tab to see performance metrics
4. Check the "Logs" section for any errors

## CORS Configuration

If you're calling the API from a different domain, add CORS headers in your API handler:

```python
def do_POST(self):
    self.send_header('Access-Control-Allow-Origin', '*')  # Or specific domain
    self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    # ...rest of your code
```

## Scaling Considerations

- Vercel Hobby tier has limitations on function execution time and concurrency
- For production usage with high traffic, consider upgrading to a Pro or Enterprise plan
- Monitor API usage to ensure you stay within plan limits
