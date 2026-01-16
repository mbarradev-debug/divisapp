# Development Setup

This guide explains how to set up the DivisApp project on your local machine for development.

## Required Tools and Versions

### Node.js

**Required version**: 20.x or higher

Node.js is the JavaScript runtime that executes the application. Check if you have it installed:

```bash
node --version
```

If you don't have Node.js or have an older version, download it from [nodejs.org](https://nodejs.org/) or use a version manager like `nvm`:

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20
```

### npm

**Required version**: 10.x or higher (comes with Node.js 20)

npm is the package manager for JavaScript. Check your version:

```bash
npm --version
```

### Git

**Required version**: Any recent version (2.x)

Git is used for version control. Check if installed:

```bash
git --version
```

If not installed, download from [git-scm.com](https://git-scm.com/) or install via your package manager.

### Code Editor

**Recommended**: Visual Studio Code

While any editor works, VS Code has excellent TypeScript and React support. Recommended extensions:

- **ESLint**: Shows linting errors inline
- **Tailwind CSS IntelliSense**: Autocomplete for Tailwind classes
- **TypeScript and JavaScript Language Features**: Built-in, provides type checking

## How to Install Dependencies

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd divisapp
```

### Step 2: Install npm Packages

```bash
npm install
```

This reads `package.json` and installs all required dependencies into the `node_modules` folder. This may take a few minutes the first time.

### What Gets Installed

**Production dependencies** (required to run the app):
- `next`: The web framework
- `react`: UI library
- `react-dom`: React for browsers

**Development dependencies** (only needed for development):
- `typescript`: Type checking
- `tailwindcss`: CSS framework
- `eslint`: Code linting
- `vitest`: Test runner
- Various type definitions (`@types/*`)

## How to Run the Project Locally

### Development Server

```bash
npm run dev
```

This starts the development server with:
- Hot reloading (changes appear instantly)
- Error overlay (errors shown in browser)
- TypeScript checking

Open [http://localhost:3000](http://localhost:3000) in your browser.

### What You Should See

1. The home page loads with a list of economic indicators
2. Clicking an indicator shows its detail page
3. The "Convertir" link in the header opens the conversion tool
4. All data comes from the live mindicador.cl API

### Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## How to Build the Project

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `.next` folder. The build process:

1. Compiles TypeScript to JavaScript
2. Bundles and minifies code
3. Optimizes images and assets
4. Pre-renders static pages

### Running the Production Build

After building:

```bash
npm start
```

This starts a production server at [http://localhost:3000](http://localhost:3000). The production server is faster but doesn't have hot reloading.

### When to Use Production Build

- Testing performance
- Verifying the build works before deployment
- Debugging production-only issues

For daily development, use `npm run dev` instead.

## Running Tests

### Watch Mode (Recommended for Development)

```bash
npm test
```

This starts Vitest in watch mode:
- Runs tests on file changes
- Shows test results in terminal
- Press `q` to quit

### Single Run

```bash
npm run test:run
```

Runs all tests once and exits. Useful for CI/CD or quick verification.

### Current Tests

The project has tests for the API client in `lib/api/__tests__/mindicador.test.ts`. These test:
- Successful API responses
- Error handling
- Response validation

## Linting

### Check Code Style

```bash
npm run lint
```

ESLint checks for:
- TypeScript errors
- React best practices
- Code style issues
- Accessibility problems

### Fixing Issues

Some issues can be fixed automatically:

```bash
npm run lint -- --fix
```

Other issues require manual fixes. The error messages explain what's wrong.

## Common Issues and How to Fix Them

### Issue: `npm install` fails with permission errors

**Cause**: npm is trying to install globally or there's a permissions issue.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

If still failing, check folder permissions or reinstall Node.js.

### Issue: Port 3000 is already in use

**Cause**: Another application is using port 3000.

**Solution**:
```bash
# Option 1: Use a different port
npm run dev -- -p 3001

# Option 2: Find and kill the process using port 3000
lsof -i :3000  # Find the process
kill -9 <PID>  # Kill it
```

### Issue: "Module not found" errors

**Cause**: Dependencies weren't installed or are corrupted.

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: TypeScript errors in editor but build works

**Cause**: Your editor's TypeScript version doesn't match the project's.

**Solution** (VS Code):
1. Open a TypeScript file
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
3. Type "TypeScript: Select TypeScript Version"
4. Choose "Use Workspace Version"

### Issue: API data doesn't load

**Cause**: Network issues or mindicador.cl is down.

**Solution**:
1. Check your internet connection
2. Try accessing [https://mindicador.cl/api](https://mindicador.cl/api) directly
3. The API is occasionally unavailable; wait and try again

### Issue: Styles don't appear correctly

**Cause**: Tailwind CSS isn't processing correctly.

**Solution**:
```bash
# Restart the dev server
# (Stop with Ctrl+C, then start again)
npm run dev
```

If still broken, check that `globals.css` imports Tailwind correctly.

### Issue: Hot reload isn't working

**Cause**: File watching may be hitting system limits.

**Solution** (Linux):
```bash
# Increase file watch limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Solution** (Mac): Restart the dev server.

## Environment Variables

DivisApp requires environment variables for some features.

### Required Variables

Create a `.env.local` file in the project root:

```bash
# Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Web Push (for notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
```

### How to Get These Values

**Supabase**: Go to your Supabase project → Settings → API → Copy URL and anon key.

**VAPID Keys**: Generate using:
```bash
npx web-push generate-vapid-keys
```

### Server-Side Secrets (Supabase)

For the Edge Function to work, configure secrets:

```bash
npx supabase secrets set \
  VAPID_PUBLIC_KEY="your-public-key" \
  VAPID_PRIVATE_KEY="your-private-key"
```

**Important**: Never commit `.env.local` to Git. It's already in `.gitignore`.

## Folder Permissions

Ensure you have write access to:
- The project folder (for `node_modules`)
- The `.next` folder (for build output)

If you cloned with sudo or have permission issues:
```bash
sudo chown -R $(whoami) .
```

## Next Steps

After setup is complete:
1. Read the [Architecture Overview](../architecture/overview.md)
2. Review the [Folder Structure](../architecture/folder-structure.md)
3. Check [Development Workflows](./workflows.md) for daily practices
4. For push notification testing, see [HTTPS Local Development](./https-local-development.md)
