# How to Add Images to Your Portfolio

## Folder Structure

Your images are organized like this:

```
jr-portfolio/
├── images/
│   ├── case-studies/
│   │   └── nao/              ← Put NAO case study images here
│   │       ├── hero.png
│   │       ├── wireframes.png
│   │       ├── final-design.png
│   │       └── ...
│   └── general/              ← Put general images here
│       ├── avatar.png
│       └── ...
├── index.html
├── about.html
└── case-study-nao.html
```

---

## Adding Images to Homepage Cards

### Current State (Placeholder):
```html
<div class="card-image">
    <!-- Replace with: <img src="images/case-studies/nao/hero.png" alt="NAO Platform"> -->
    <div class="card-placeholder">🏦</div>
</div>
```

### To Add Your Image:
1. **Save your image** to `images/case-studies/nao/hero.png`
2. **Replace the placeholder** with:
```html
<div class="card-image">
    <img src="images/case-studies/nao/hero.png" alt="NAO Platform">
</div>
```

**That's it!** The image will automatically:
- Fill the card
- Crop to fit (object-fit: cover)
- Have the gradient overlay on top

---

## Adding Images to Case Studies

### Option 1: Add Hero Image to Case Study
Add this after the hero section in `case-study-nao.html`:

```html
<section class="content-section">
    <div class="case-study-image">
        <img src="images/case-studies/nao/hero.png" alt="NAO Platform Overview">
    </div>
</section>
```

### Option 2: Add Image Gallery
Add multiple images in a grid:

```html
<section class="content-section">
    <h2 class="section-title">Visual Design</h2>
    <div class="image-grid">
        <img src="images/case-studies/nao/design-1.png" alt="Dashboard Design">
        <img src="images/case-studies/nao/design-2.png" alt="Account Flow">
        <img src="images/case-studies/nao/design-3.png" alt="Component Library">
    </div>
</section>
```

### Option 3: Add Full-Width Image with Caption
```html
<section class="content-section">
    <figure class="case-study-figure">
        <img src="images/case-studies/nao/wireframes.png" alt="Early wireframes">
        <figcaption>Early wireframes exploring the account opening flow</figcaption>
    </figure>
</section>
```

---

## Image Requirements & Best Practices

### Recommended Sizes:
- **Homepage cards**: 600x480px (or 1200x960px for retina)
- **Case study hero**: 1400x800px
- **Case study images**: 1200x800px
- **Gallery images**: 800x600px

### File Formats:
- **PNG** - Best for UI screenshots, design mockups
- **JPG** - Best for photos, complex images (smaller file size)
- **WebP** - Best for everything (modern format, smaller files)

### Optimization Tips:
1. **Compress your images** before uploading (use TinyPNG.com or Squoosh.app)
2. **Use descriptive alt text** for accessibility
3. **Keep file sizes under 500KB** when possible

---

## Quick Copy-Paste Templates

### Homepage Card with Image:
```html
<div class="card-image">
    <img src="images/case-studies/nao/hero.png" alt="NAO Platform">
</div>
```

### Case Study Single Image:
```html
<div class="case-study-image">
    <img src="images/case-studies/nao/your-image.png" alt="Description">
</div>
```

### Case Study Image with Caption:
```html
<figure class="case-study-figure">
    <img src="images/case-studies/nao/your-image.png" alt="Description">
    <figcaption>Your caption text here</figcaption>
</figure>
```

### Image Grid (2 columns):
```html
<div class="image-grid">
    <img src="images/case-studies/nao/image-1.png" alt="Description 1">
    <img src="images/case-studies/nao/image-2.png" alt="Description 2">
</div>
```

---

## Adding Images via Terminal (if needed)

```bash
# Navigate to your project
cd /Users/johnrubino/Desktop/jr-portfolio

# Copy an image from Downloads
cp ~/Downloads/my-screenshot.png images/case-studies/nao/hero.png

# Or drag and drop images directly into the folder in Finder
```

---

## Troubleshooting

**Image not showing?**
- Check the file path is correct (case-sensitive!)
- Make sure the file extension matches (.png vs .PNG)
- Refresh your browser (Cmd+Shift+R to hard refresh)

**Image looks stretched/squished?**
- Use the correct aspect ratio for the location
- Images use `object-fit: cover` which crops to fit

**Image file too large?**
- Compress at https://tinypng.com
- Or resize in Preview (Tools → Adjust Size)

---

## Next Steps

1. ✅ Folder structure is ready
2. ✅ HTML is image-ready with comments
3. ⬜ Add your images to `images/case-studies/nao/`
4. ⬜ Replace placeholders with `<img>` tags
5. ⬜ Test and refresh!

Need help? The HTML comments show you exactly what to replace!

---

## Hiring-link image placeholders (`hiring.html`)

Missing images in the hiring-link case studies are marked with invisible HTML comments, each with a stable ID:

```html
<!-- 📸 IMAGE PLACEHOLDER [FOWA-01]: description of the intended visual
     <figure class="case-study-figure"><img src="images/case-studies/FOLDER/FILENAME.png" alt="DESCRIPTION"></figure> -->
```

**To fill one:** save the image to the case study's folder, then replace the whole comment with the `<figure>` line inside it, with `FOLDER`, `FILENAME` and `DESCRIPTION` filled in. Search `hiring.html` for the ID (e.g. `[FOWA-05]`) to find the exact spot. Folders: Future of Wealth Advisory → `images/case-studies/platform-vision/`, Fully Paid Lending → `images/case-studies/fpl/`. Filenames are case-sensitive on Vercel. Once a placeholder is filled, delete its row below.

Don't use visible placeholder boxes (`.image-placeholder`) on the hiring page; hiring managers see them.

| ID | Case study | Section (nearest heading) | Intended visual |
|---|---|---|---|
| `FOWA-01` | Future of Wealth Advisory | Two platforms, one future | Platform context diagram — NetX360 and Wove as two separate systems with an arrow pointing toward a unified future platform |
| `FOWA-02` | Future of Wealth Advisory | The finding that shaped everything: advisors never start with complete information | Journey gap analysis — discovery research mapping the gap between how advisors actually worked and what the legacy tool assumed about them. |
| `FOWA-03` | Future of Wealth Advisory | The open design questions | Wireframe detail — open design question annotations around navigation placement and sub-flow handling. Open questions mapped visually: each decision had downstream implications for how users would navigate complexity. |
| `FOWA-04` | Future of Wealth Advisory | The To-Do List in high fidelity | Pre-flow final design — Custodian → Account Type → Sub Type in high fidelity. The pre-flow in final form: three decisions that scope the experience before it begins. |
| `FOWA-05` | Future of Wealth Advisory | The send-to-client capability | Send to client toggle — shown in context within the Contact and Personal Information form section, in high fidelity. "Send to client" in the finished design: a persistent affordance that makes the collaborative model explicit at the point of need. |
| `FOWA-06` | Future of Wealth Advisory | The send-to-client capability | Collaborative flow diagram — advisor and client parallel paths shown as a finished interaction model. The full flow: advisor initiates, client fills in directly, data merges automatically into the application. |
| `FOWA-07` | Future of Wealth Advisory | Validating the Design | Account Details section showing restrictions auto-filled and beneficiaries table. Auto-filled restrictions and beneficiaries were celebrated — but surfaced a new design need: how do you help users verify that pre-populated data is correct? |
| `FOWA-08` | Future of Wealth Advisory | Validating the Design | Documents section — Select and Send feature showing required and optional document categories. Documents: the select-and-send pattern resonated strongly. The next iteration would separate required from optional documents and add document preview. |
| `FOWA-09` | Future of Wealth Advisory | Validating the Design | Confirmation screen — "New account has been created" with Submit ≠ Create annotation. Submit ≠ create: the confirmation language implied completion before completion had occurred — a meaningful trust issue in a high-stakes workflow. |
| `FOWA-10` | Future of Wealth Advisory | Exploration: Two Users, Two Approaches | Asset Movement wireframe exploration overview — showing both power user and advisor approaches side by side. Exploration phase: two tracks for two fundamentally different user needs. |
| `FOWA-11` | Future of Wealth Advisory | Exploration: Two Users, Two Approaches | Asset Movement V1 usability study summary — key findings across 11 advisors from named firms. V1 study findings: step order worked, but visibility, documentation, standing instructions, and post-submission clarity all needed to change. |
| `FOWA-12` | Future of Wealth Advisory | Edit without losing context | Collapsing stepper with one step reopened for editing — surrounding summary cards still visible. Edit at any point: change what you need, keep everything else. No starting over. |
| `FOWA-13` | Future of Wealth Advisory | Honest end states | Common Thread summary — five principles visualized across NAO and Asset Movement side by side. Two workflows, five shared principles. The convergence wasn't planned — it emerged from treating both problems with the same research-driven discipline. |
| `FPL-01` | Fully Paid Lending | The Numbers Raised More Questions Than Answers | Data points above the fold in the legacy interface—revenue tracking and participant data were present, but no methodology context explained how figures were calculated or what assumptions they reflected. |
