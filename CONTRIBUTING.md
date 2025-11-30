# Contributing Guide

Thank you for considering contributing to the No-Code AI App Builder!

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/no-code-ai-app-builder.git
   cd no-code-ai-app-builder
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your GROQ_API_KEY
   ```

5. **Initialize database**
   ```bash
   pnpm db:push
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

Example: `feature/add-export-functionality`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

Example: `feat: add code export functionality`

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (run `pnpm format`)
- **Linting**: ESLint rules enforced
- **Type Checking**: Run `pnpm check` before committing

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm check
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   pnpm check
   pnpm test
   pnpm build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Submit!

## PR Guidelines

### Title
Clear and descriptive: `feat: add dark mode toggle`

### Description
Include:
- What changes were made
- Why the changes were necessary
- How to test the changes
- Screenshots (if UI changes)

### Checklist
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers (if frontend)

## Code Review

- Be respectful and constructive
- Respond to feedback promptly
- Make requested changes in new commits
- Squash commits before merging (if requested)

## Areas for Contribution

### High Priority
- [ ] Add user authentication (optional)
- [ ] Implement app templates
- [ ] Add more export formats (React, Vue, etc.)
- [ ] Improve AI prompts for better code generation
- [ ] Add code syntax highlighting in preview

### Medium Priority
- [ ] Add app versioning
- [ ] Implement undo/redo functionality
- [ ] Add collaborative editing
- [ ] Create app gallery/showcase
- [ ] Add analytics dashboard

### Low Priority
- [ ] Add more themes
- [ ] Implement keyboard shortcuts
- [ ] Add tutorial/onboarding
- [ ] Create video demos
- [ ] Add internationalization (i18n)

## Bug Reports

Use GitHub Issues with:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos
- Environment details (OS, browser, Node version)

## Feature Requests

Use GitHub Issues with:
- Clear description
- Use case/motivation
- Proposed solution
- Alternative solutions considered

## Questions?

- Open a GitHub Discussion
- Check existing issues
- Review documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
