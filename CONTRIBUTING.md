# Contributing to Amplify Creator Platform

Thank you for your interest in contributing to Amplify Creator Platform! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Be collaborative and constructive
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/CreatorStudioLite.git
   cd CreatorStudioLite
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Krosebrook/CreatorStudioLite.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔄 Development Workflow

1. **Keep your fork updated**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Make your changes** in your feature branch

3. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   npm test
   ```

4. **Commit your changes** (see [Commit Guidelines](#commit-guidelines))

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** from your fork to the main repository

## 💻 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper type definitions
- Enable strict mode in TypeScript configuration
- Use interfaces for object shapes
- Use type unions instead of enums where appropriate

### Code Style

- Follow the existing code style
- Use ESLint and fix all linting errors:
  ```bash
  npm run lint
  ```
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add comments for complex logic
- Use async/await instead of raw Promises

### React Best Practices

- Use functional components with hooks
- Keep components small and reusable
- Use proper prop typing with TypeScript
- Avoid inline styles (use Tailwind CSS classes)
- Use context sparingly (prefer prop drilling for shallow trees)
- Memoize expensive computations with `useMemo`
- Use `useCallback` for callbacks passed to child components

### File Organization

- One component per file
- Group related files in directories
- Use index files for cleaner imports
- Keep services separate from UI components
- Place shared utilities in `/src/utils`
- Place shared types in `/src/types`

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without behavior changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or tooling changes
- `ci`: CI/CD configuration changes

### Examples

```
feat(analytics): add daily engagement chart

Add a new chart component that displays daily engagement metrics
across all connected platforms.

Closes #123
```

```
fix(auth): resolve token refresh issue

Fix the token refresh mechanism that was causing users to be
logged out unexpectedly.

Fixes #456
```

## 🔍 Pull Request Process

1. **Update documentation** if you're adding or changing features
2. **Add tests** for new functionality
3. **Ensure all tests pass** locally
4. **Update the README.md** if needed
5. **Reference related issues** in the PR description
6. **Request review** from maintainers
7. **Address review feedback** promptly

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main
- [ ] PR description clearly explains the changes

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run smoke tests
npm run smoke-test

# Run health checks
npm run health-check
```

### Writing Tests

- Write tests for all new features
- Include both positive and negative test cases
- Mock external dependencies (Supabase, Stripe, etc.)
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

## 📚 Documentation

Good documentation is crucial. When contributing:

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms
- Explain non-obvious decisions
- Keep comments up to date with code changes

### User Documentation

- Update README.md for user-facing changes
- Add examples for new features
- Update API documentation
- Include screenshots for UI changes

### Internal Documentation

- Document architecture decisions
- Explain design patterns used
- Add setup instructions for development
- Document environment variables

## 🐛 Reporting Bugs

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, browser, etc.)
- Screenshots or error messages (if applicable)
- Relevant logs

## 💡 Suggesting Enhancements

When suggesting enhancements:

- Clearly describe the feature
- Explain the use case
- Discuss potential implementation approaches
- Consider backwards compatibility
- Be open to feedback and discussion

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/Krosebrook/CreatorStudioLite/discussions)
- **Bugs**: Open a [GitHub Issue](https://github.com/Krosebrook/CreatorStudioLite/issues)
- **Security**: See [SECURITY.md](SECURITY.md)

## 🏆 Recognition

Contributors will be recognized in:
- The project README
- Release notes
- The contributors list on GitHub

Thank you for contributing to Amplify Creator Platform! 🎉
