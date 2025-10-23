# Contributing Guide

Thanks for contributing to DeepSeek Chat App!

## Quick Start

```bash
# 1. Fork & clone
git clone https://github.com/YOUR_USERNAME/DeepSeek-Clone.git
cd deepseek

# 2. Install
npm install

# 3. Setup env (see SETUP.md)
cp .env.example .env

# 4. Create branch
git checkout -b feature/your-feature-name

# 5. Make changes & test
npm run dev
npm run lint

# 6. Commit & push
git commit -m "Add: your feature description"
git push origin feature/your-feature-name

# 7. Create Pull Request
```

## Code Style

- Use **ESLint**: `npm run lint`
- **Functional components** with hooks
- **Meaningful names**: `handleUpload` not `doStuff`
- **Small components**: One responsibility per component
- **Comments** for complex logic

## Branch Naming

- `feature/add-pdf-support`
- `fix/gemini-vision-error`
- `docs/update-readme`
- `refactor/cleanup-api`

## Commit Messages

```bash
# Good
git commit -m "Add PDF extraction support"
git commit -m "Fix context chain for previous messages"
git commit -m "Update setup documentation"

# Bad  
git commit -m "update"
git commit -m "fix bug"
```

## What to Contribute

### 🌟 Feature Ideas
- PDF/DOCX extraction
- Voice messages
- Chat export (JSON/MD)
- Dark mode
- Message editing
- Code execution

### 🐛 Bug Reports
Include:
1. What happened?
2. How to reproduce?
3. Expected vs actual behavior
4. Screenshots (if applicable)
5. Environment (OS, browser, Node version)

### 📚 Documentation
- Improve clarity
- Add examples
- Fix typos
- Create tutorials

## Pull Request Process

1. **Test your changes** thoroughly
2. **Run lint**: `npm run lint`
3. **Update docs** if needed
4. **Clear description** of what changed and why
5. **Small PRs**: Split large changes into smaller ones

### PR Template

```markdown
## Description
Brief description of changes

## Type
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation
- [ ] Refactoring

## Testing
How was this tested?

## Screenshots (if UI changes)
```

## Don't Do This

- ❌ Commit `node_modules/`
- ❌ Commit `.env` file
- ❌ Commit `Documents/` folder
- ❌ Push API keys
- ❌ Make huge PRs (split them up)

## File Structure

```
app/api/chat/     # API routes
components/       # UI components
models/           # MongoDB schemas
config/           # Configuration
context/          # React context
```

## Testing Guidelines

- Test auth flow
- Test file uploads
- Test AI responses
- Test page reloads
- Check browser console for errors

## Questions?

- Check [SETUP.md](SETUP.md)
- Check [README.md](README.md)
- Create an issue
- Ask in PR comments

## Recognition

All contributors are acknowledged in the README!

## License

By contributing, you agree your contributions will be under the MIT License.

---

Happy contributing! 🚀
