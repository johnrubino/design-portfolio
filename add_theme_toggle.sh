#!/bin/bash

# CSS to add light mode variables (after dark mode variables)
LIGHT_THEME_CSS='
        [data-theme="light"] {
            --primary-bg: #ffffff;
            --secondary-bg: #f5f5f7;
            --surface-bg: #e8e8ea;
            --border-color: #d1d1d6;
            --text-primary: #1a1a1a;
            --text-secondary: #666666;
            --accent-orange: #FF8C42;
            --accent-purple: #667eea;
        }'

# CSS for theme toggle button
TOGGLE_CSS='
        .theme-toggle {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: var(--surface-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 200ms ease;
            margin-left: 12px;
        }

        .theme-toggle:hover {
            background: var(--border-color);
            transform: scale(1.05);
        }

        .theme-toggle:active {
            transform: scale(0.95);
        }'

# JavaScript for theme toggle
THEME_JS='
    <script>
        // Theme Toggle
        const themeToggle = document.getElementById("themeToggle");
        const themeIcon = themeToggle.querySelector(".theme-icon");
        const html = document.documentElement;

        // Check for saved theme preference or default to dark mode
        const savedTheme = localStorage.getItem("theme") || "dark";

        // Apply saved theme
        if (savedTheme === "light") {
            html.setAttribute("data-theme", "light");
            themeIcon.textContent = "🌙";
        } else {
            html.removeAttribute("data-theme");
            themeIcon.textContent = "☀️";
        }

        // Toggle theme
        themeToggle.addEventListener("click", () => {
            const currentTheme = html.getAttribute("data-theme");

            if (currentTheme === "light") {
                // Switch to dark mode
                html.removeAttribute("data-theme");
                themeIcon.textContent = "☀️";
                localStorage.setItem("theme", "dark");
            } else {
                // Switch to light mode
                html.setAttribute("data-theme", "light");
                themeIcon.textContent = "🌙";
                localStorage.setItem("theme", "light");
            }
        });
    </script>'

for file in about.html writing.html case-study-nao.html case-study-asset-movement.html case-study-fully-paid-lending.html; do
  echo "Processing $file..."
  
  # Add light theme CSS variables after dark mode variables
  sed -i '' '/--accent-purple: #667eea;/a\
'"$LIGHT_THEME_CSS"'
' "$file"
  
  # Add transition to body
  sed -i '' 's/min-height: 100vh;/min-height: 100vh;\
            transition: background 300ms ease, color 300ms ease;/' "$file"
  
  # Add theme toggle CSS after .nav-link.active
  sed -i '' '/\.nav-link\.active {/,/}/a\
'"$TOGGLE_CSS"'
' "$file"
  
  # Add theme toggle button to nav
  sed -i '' '/<\/div>$/!b; /<\/nav>/!b; i\
            <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">\
                <span class="theme-icon">☀️</span>\
            </button>
' "$file"
  
  # Add theme toggle JavaScript before </body>
  sed -i '' 's|</body>|'"${THEME_JS}"'\
</body>|' "$file"
  
  echo "$file updated"
done

echo "All files updated successfully!"
