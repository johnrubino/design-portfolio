# Portfolio Deployment Guide

## Portfolio Structure

Your portfolio has two versions:

### 📖 Public Version (`index.html`)
- **URL**: `https://johnrubino.design` or `https://johnrubino.design/index.html`
- **Purpose**: General public viewing
- **Features**:
  - All case studies show locked state with "🔒 Confidential - Request Access"
  - Clicking locked cards opens email to `johnrubinodesign@gmail.com`
  - Subject line: "Portfolio Access Request"
- **Share with**: LinkedIn, social media, general networking, public portfolio links

### 🔓 Private Version (`hiring.html`)
- **URL**: `https://johnrubino.design/hiring.html`
- **Purpose**: Recruiters, hiring managers, and potential clients
- **Features**:
  - Full access to all case studies
  - Interactive modal/worksheet system
  - Previous/Next navigation between case studies
  - Keyboard shortcuts (ESC to close, arrows to navigate)
- **Share with**: Direct recruiter outreach, hiring manager conversations, active client prospects

---

## Quick Reference

### What to Share When

| Audience | URL to Share |
|----------|--------------|
| LinkedIn Profile | `https://johnrubino.design` |
| Social Media | `https://johnrubino.design` |
| General Networking | `https://johnrubino.design` |
| **Recruiters** | `https://johnrubino.design/hiring.html` |
| **Hiring Managers** | `https://johnrubino.design/hiring.html` |
| **Active Clients** | `https://johnrubino.design/hiring.html` |

---

## Case Studies

Current case studies (all confidential):
1. **New Account Opening** - BNY Pershing
2. **Asset Movement** - BNY Pershing
3. **Fully Paid Lending** - BNY Pershing

Status:
- ✅ New Account Opening - Complete with interactive stepper
- 🚧 Asset Movement - Placeholder
- 🚧 Fully Paid Lending - Placeholder

---

## Modal/Worksheet Features

When case studies are opened in `hiring.html`:

### Desktop
- Worksheet slides up from bottom (97% viewport height)
- Header shows: Case study title | Previous/Next buttons | Close button
- Smooth spring animations
- Click outside to close

### Mobile/Tablet
- Worksheet slides up from bottom (98% viewport height)
- Header layout:
  - **Row 1**: Case study title + Close button
  - **Row 2**: Previous/Next buttons (full width)

### Keyboard Shortcuts
- `ESC` - Close worksheet
- `←` Left arrow - Previous case study
- `→` Right arrow - Next case study

---

## Future Enhancements

### Custom Subdomain (Optional)
Set up a cleaner hiring URL:
- Current: `https://johnrubino.design/hiring.html`
- Custom: `https://hiring.johnrubino.design`

Most domain registrars support subdomain setup. This would point to the same `hiring.html` file but looks more professional.

### Analytics (Recommended)
Consider adding analytics to track:
- Public vs private version traffic
- Which recruiters/companies view your hiring portfolio
- Time spent on case studies

---

## Local Development

### View locally:
```bash
# Navigate to project folder
cd /Users/johnrubino/Desktop/jr-portfolio

# Start local server (Python 3)
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Open in browser
open http://localhost:8000
```

### File Structure
```
jr-portfolio/
├── index.html              ← Public version (locked)
├── hiring.html             ← Private version (unlocked)
├── about.html
├── writing.html
├── case-study-nao.html
├── case-study-asset-movement.html
├── case-study-fully-paid-lending.html
├── images/
│   ├── case-studies/
│   │   ├── nao/
│   │   ├── asset-movement/
│   │   └── fpl/
│   └── general/
└── HOW_TO_ADD_IMAGES.md
```

---

## Deployment Checklist

When deploying to `johnrubino.design`:

- [ ] Upload all HTML files to web host
- [ ] Upload images folder structure
- [ ] Test public version (`index.html`) - verify locked cards work
- [ ] Test hiring version (`hiring.html`) - verify modal system works
- [ ] Test on mobile/tablet devices
- [ ] Update contact email if needed (currently: `johnrubinodesign@gmail.com`)
- [ ] Test email links from locked cards
- [ ] Verify all navigation links work
- [ ] Check Substack feed integration on writing page
- [ ] Test case study stepper on NAO case study

---

## Support Links

- **LinkedIn**: https://www.linkedin.com/in/john-rubino/
- **Substack**: https://johnrubino.substack.com
- **Email**: johnrubinodesign@gmail.com

---

## Notes

- Keep the `hiring.html` URL private - only share directly with recruiters/hiring managers
- The public version encourages interested parties to reach out via email
- All case studies require access approval to maintain confidentiality
- Asset Movement and Fully Paid Lending are currently placeholders - content coming soon
