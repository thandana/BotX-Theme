/**
 * BotX Theme Toggle System
 * Dark/Light Mode Manager with System Preference Detection
 * 
 * Features:
 * - Automatic system preference detection
 * - LocalStorage persistence
 * - Smooth theme transitions
 * - Custom event dispatching
 * - Global API access
 */

(function() {
  'use strict';

  // Theme Manager Object
  const themeManager = {
    // Configuration
    STORAGE_KEY: 'botx-theme-preference',
    THEME_ATTRIBUTE: 'data-theme',
    LIGHT_THEME: 'light',
    DARK_THEME: 'dark',

    /**
     * Initialize the theme system
     */
    init: function() {
      // Check for saved theme preference or default to system preference
      const savedTheme = this.getSavedTheme();
      const preferredTheme = savedTheme || this.getSystemTheme();
      
      // Apply the theme
      this.setTheme(preferredTheme, false);
      
      // Create and inject toggle button
      this.createToggleButton();
      
      // Listen for system theme changes
      this.watchSystemTheme();
      
      // Make themeManager globally available
      window.themeManager = this;
      
      console.log('BotX Theme System initialized. Current theme:', preferredTheme);
    },

    /**
     * Get the system's preferred theme
     */
    getSystemTheme: function() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return this.DARK_THEME;
      }
      return this.LIGHT_THEME;
    },

    /**
     * Get saved theme preference from localStorage
     */
    getSavedTheme: function() {
      return localStorage.getItem(this.STORAGE_KEY);
    },

    /**
     * Get current active theme
     */
    getTheme: function() {
      return document.documentElement.getAttribute(this.THEME_ATTRIBUTE) || this.LIGHT_THEME;
    },

    /**
     * Set theme and trigger events
     */
    setTheme: function(theme, savePreference = true) {
      // Validate theme
      if (theme !== this.LIGHT_THEME && theme !== this.DARK_THEME) {
        console.warn('Invalid theme:', theme, 'Using light theme instead');
        theme = this.LIGHT_THEME;
      }

      // Apply theme to document
      if (theme === this.LIGHT_THEME) {
        document.documentElement.removeAttribute(this.THEME_ATTRIBUTE);
      } else {
        document.documentElement.setAttribute(this.THEME_ATTRIBUTE, this.DARK_THEME);
      }

      // Save preference if requested
      if (savePreference) {
        localStorage.setItem(this.STORAGE_KEY, theme);
      }

      // Update toggle button state
      this.updateToggleButton(theme);

      // Dispatch custom event
      this.dispatchThemeChangeEvent(theme);

      // Update meta theme-color
      this.updateMetaThemeColor(theme);
    },

    /**
     * Toggle between themes
     */
    toggleTheme: function() {
      const currentTheme = this.getTheme();
      const newTheme = currentTheme === this.LIGHT_THEME ? this.DARK_THEME : this.LIGHT_THEME;
      this.setTheme(newTheme, true);
    },

    /**
     * Reset to system theme
     */
    resetToSystemTheme: function() {
      localStorage.removeItem(this.STORAGE_KEY);
      const systemTheme = this.getSystemTheme();
      this.setTheme(systemTheme, false);
    },

    /**
     * Create and inject toggle button
     */
    createToggleButton: function() {
      // Check if button already exists
      if (document.querySelector('.theme-toggle')) {
        return;
      }

      // Create button element
      const button = document.createElement('button');
      button.className = 'theme-toggle';
      button.type = 'button';
      button.setAttribute('aria-label', 'Toggle dark/light theme');
      button.setAttribute('title', 'Toggle Theme');
      
      // Create icon
      const icon = document.createElement('i');
      icon.className = 'lni lni-moon';
      
      button.appendChild(icon);

      // Add click handler
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleTheme();
      });

      // Find navigation to insert button
      const navbar = document.querySelector('.navbar-nav');
      if (navbar) {
        // Create list item wrapper
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.style.marginLeft = 'auto';
        li.appendChild(button);
        
        navbar.appendChild(li);
      } else {
        // Fallback: append to body
        document.body.appendChild(button);
      }
    },

    /**
     * Update toggle button icon
     */
    updateToggleButton: function(theme) {
      const button = document.querySelector('.theme-toggle');
      if (!button) return;

      const icon = button.querySelector('i');
      if (!icon) return;

      // Update icon based on theme
      icon.className = theme === this.DARK_THEME ? 'lni lni-sun' : 'lni lni-moon';

      // Update aria-label
      button.setAttribute(
        'aria-label',
        theme === this.DARK_THEME ? 'Switch to light theme' : 'Switch to dark theme'
      );
      button.setAttribute(
        'title',
        theme === this.DARK_THEME ? 'Light Mode' : 'Dark Mode'
      );
    },

    /**
     * Update meta theme-color tag
     */
    updateMetaThemeColor: function(theme) {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
      }

      // Set color based on theme
      if (theme === this.DARK_THEME) {
        metaThemeColor.setAttribute('content', '#0f172a');
      } else {
        metaThemeColor.setAttribute('content', '#ffffff');
      }
    },

    /**
     * Dispatch custom theme change event
     */
    dispatchThemeChangeEvent: function(theme) {
      const event = new CustomEvent('themechange', {
        detail: {
          theme: theme,
          isDark: theme === this.DARK_THEME,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(event);
    },

    /**
     * Watch for system theme changes
     */
    watchSystemTheme: function() {
      if (!window.matchMedia) return;

      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      try {
        // Modern browsers (addEventListener supported)
        darkModeQuery.addEventListener('change', (e) => {
          // Only apply if user hasn't set a preference
          if (!this.getSavedTheme()) {
            const newTheme = e.matches ? this.DARK_THEME : this.LIGHT_THEME;
            this.setTheme(newTheme, false);
          }
        });
      } catch (error) {
        // Fallback for older browsers
        try {
          darkModeQuery.addListener((e) => {
            if (!this.getSavedTheme()) {
              const newTheme = e.matches ? this.DARK_THEME : this.LIGHT_THEME;
              this.setTheme(newTheme, false);
            }
          });
        } catch (fallbackError) {
          console.warn('System theme change detection not supported');
        }
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      themeManager.init();
    });
  } else {
    themeManager.init();
  }

  // Also expose through window for direct access
  window.themeManager = themeManager;

})();

/**
 * Usage Examples:
 * 
 * Get current theme:
 *   window.themeManager.getTheme()
 * 
 * Set theme:
 *   window.themeManager.setTheme('dark')
 *   window.themeManager.setTheme('light')
 * 
 * Toggle theme:
 *   window.themeManager.toggleTheme()
 * 
 * Reset to system preference:
 *   window.themeManager.resetToSystemTheme()
 * 
 * Listen for theme changes:
 *   window.addEventListener('themechange', (event) => {
 *     console.log('Theme changed to:', event.detail.theme)
 *   })
 */
