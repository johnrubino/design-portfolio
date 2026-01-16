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
