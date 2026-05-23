// Aura Settings - Interactive Animations & Logic
document.addEventListener("DOMContentLoaded", () => {

  // ─────────────────────────────────────────────────────────────
  // 1. Smooth Section Transitions (like room switching in app.js)
  // ─────────────────────────────────────────────────────────────
  function switchSection(sectionId, btn) {
    // Fade out current section
    document.querySelectorAll('.section').forEach(sec => {
      if (sec.classList.contains('active')) {
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(-8px)';
        setTimeout(() => {
          sec.classList.remove('active');
          sec.style.opacity = '1';
          sec.style.transform = 'translateY(0)';
        }, 200);
      }
    });

    // Fade in new section
    setTimeout(() => {
      const target = document.getElementById(`section-${sectionId}`);
      if (target) {
        target.classList.add('active');
        target.style.opacity = '0';
        target.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
          target.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        });
      }
    }, 200);

    // Update nav item active state with ripple effect
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      item.style.transform = 'scale(1)';
    });
    btn.classList.add('active');
    btn.style.transform = 'scale(1.02)';
    setTimeout(() => btn.style.transform = 'scale(1)', 150);
  }

  // Attach click handlers to nav items
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const section = this.dataset.section;
      if (section) switchSection(section, this);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Toggle Switch Animation (with haptic feedback simulation)
  // ─────────────────────────────────────────────────────────────
  document.querySelectorAll('.toggle-wrap input').forEach(toggle => {
    const slider = toggle.nextElementSibling;
    
    toggle.addEventListener('change', function() {
      // Animate slider thumb
      slider.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Visual feedback: pulse effect on parent card
      const card = this.closest('.card');
      if (card) {
        card.style.boxShadow = '0 0 0 3px rgba(0,162,255,0.3)';
        setTimeout(() => {
          card.style.boxShadow = '';
        }, 300);
      }
      
      // Trigger toast notification
      showToast(`${this.closest('.card-row')?.querySelector('.row-label')?.textContent || 'Setting'} updated`);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Input Field Focus Animations
  // ─────────────────────────────────────────────────────────────
  document.querySelectorAll('.field-input, .field-select').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'translateY(-2px)';
      this.parentElement.style.transition = 'transform 0.2s ease';
      this.style.borderColor = 'rgba(0,162,255,0.6)';
      this.style.boxShadow = '0 0 0 3px rgba(0,162,255,0.15)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'translateY(0)';
      this.style.borderColor = '';
      this.style.boxShadow = '';
    });
    
    // Real-time validation feedback
    input.addEventListener('input', function() {
      if (this.validity.valid) {
        this.style.borderColor = 'rgba(0,226,114,0.5)';
      } else if (this.value.length > 0) {
        this.style.borderColor = 'rgba(220,38,38,0.5)';
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Save Button with Loading Animation & Toast
  // ─────────────────────────────────────────────────────────────
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Loading state
      const originalText = this.textContent;
      this.textContent = 'Saving...';
      this.disabled = true;
      this.style.opacity = '0.7';
      
      // Simulate API call
      setTimeout(() => {
        this.textContent = originalText;
        this.disabled = false;
        this.style.opacity = '1';
        
        // Success animation
        this.style.transform = 'scale(0.98)';
        setTimeout(() => this.style.transform = 'scale(1)', 100);
        
        showToast('✓ Settings saved successfully');
        
        // Pulse effect on section header
        const section = this.closest('.section');
        if (section) {
          const header = section.querySelector('.section-title');
          if (header) {
            header.style.color = 'var(--accent-green)';
            setTimeout(() => header.style.color = '', 500);
          }
        }
      }, 800);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Search Filter with Live Animation
  // ─────────────────────────────────────────────────────────────
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      let visibleCount = 0;
      
      document.querySelectorAll('.nav-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        const match = text.includes(query);
        
        if (match) {
          item.style.display = '';
          item.style.opacity = '0';
          item.style.transform = 'translateX(-10px)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, visibleCount * 30);
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });
      
      // Show/hide group labels
      document.querySelectorAll('.nav-group').forEach(group => {
        const visibleItems = group.querySelectorAll('.nav-item[style*="display: "]');
        const hasVisible = [...group.querySelectorAll('.nav-item')].some(i => i.style.display !== 'none');
        group.style.display = hasVisible ? '' : 'none';
      });
      
      // Empty state message
      let emptyMsg = document.getElementById('search-empty');
      if (visibleCount === 0 && query) {
        if (!emptyMsg) {
          emptyMsg = document.createElement('div');
          emptyMsg.id = 'search-empty';
          emptyMsg.style.cssText = 'padding:20px;text-align:center;color:var(--text3);font-size:13px;';
          emptyMsg.textContent = 'No settings found';
          document.querySelector('.settings-sidebar').appendChild(emptyMsg);
        }
      } else if (emptyMsg) {
        emptyMsg.remove();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Toast Notification System (like app.js emergency overlay)
  // ─────────────────────────────────────────────────────────────
  function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    
    // Create if doesn't exist
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.innerHTML = `<div class="toast-dot"></div><span id="toast-msg"></span>`;
      document.body.appendChild(toast);
    }
    
    const msgEl = document.getElementById('toast-msg');
    const dot = toast.querySelector('.toast-dot');
    
    // Set message and color
    msgEl.textContent = message;
    dot.style.background = type === 'success' ? 'var(--accent-green)' : 
                          type === 'error' ? 'var(--accent-red)' : 'var(--accent-blue)';
    
    // Animate in
    toast.classList.remove('show');
    void toast.offsetWidth; // reflow
    toast.classList.add('show');
    
    // Auto hide
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  window.showToast = showToast; // expose globally

  // ─────────────────────────────────────────────────────────────
  // 7. Range Slider with Live Value Display (like AC dials)
  // ─────────────────────────────────────────────────────────────
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    const display = document.getElementById(slider.id.replace('slider', 'val')) || 
                   slider.nextElementSibling;
    
    function updateValue() {
      if (display) {
        display.textContent = slider.value + (slider.dataset.unit || '');
        
        // Animate the fill bar if it exists
        const fill = slider.parentElement.querySelector('.stat-fill');
        if (fill) {
          const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
          fill.style.width = `${percent}%`;
          fill.style.transition = 'width 0.15s ease';
        }
      }
    }
    
    slider.addEventListener('input', updateValue);
    slider.addEventListener('change', () => showToast('Value updated'));
    updateValue(); // initial call
  });

  // ─────────────────────────────────────────────────────────────
  // 8. Card Hover Lift Effect (subtle 3D)
  // ─────────────────────────────────────────────────────────────
  document.querySelectorAll('.card, .tcard').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px)';
      this.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
      this.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '';
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 9. Back Button with Slide Transition to index.html
  // ─────────────────────────────────────────────────────────────
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Animate page exit
      document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateX(20px)';
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 300);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 10. Initialize: Load saved preferences from localStorage
  // ─────────────────────────────────────────────────────────────
  function loadPreferences() {
    // Example: Restore toggle states
    document.querySelectorAll('.toggle-wrap input').forEach(toggle => {
      const key = `settings_${toggle.id || toggle.name}`;
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        toggle.checked = saved === 'true';
      }
      toggle.addEventListener('change', () => {
        localStorage.setItem(key, toggle.checked);
      });
    });
    
    // Example: Restore text inputs
    document.querySelectorAll('.field-input').forEach(input => {
      const key = `settings_${input.name || input.id}`;
      const saved = localStorage.getItem(key);
      if (saved) input.value = saved;
      input.addEventListener('change', () => {
        localStorage.setItem(key, input.value);
      });
    });
  }
  loadPreferences();

  // ─────────────────────────────────────────────────────────────
  // 11. Keyboard Navigation Support
  // ─────────────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // Escape: go back to dashboard
    if (e.key === 'Escape') {
      window.location.href = 'index.html';
    }
    
    // Arrow keys: navigate sidebar
    if (e.target.classList.contains('nav-item')) {
      const items = [...document.querySelectorAll('.nav-item[style*="display: "]')].filter(i => i.offsetParent);
      const idx = items.indexOf(e.target);
      
      if (e.key === 'ArrowDown' && idx < items.length - 1) {
        items[idx + 1].focus();
        items[idx + 1].click();
      } else if (e.key === 'ArrowUp' && idx > 0) {
        items[idx - 1].focus();
        items[idx - 1].click();
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 12. Keep background image persistent (don't override CSS)
  // ─────────────────────────────────────────────────────────────
  // Background is set via CSS with proper image and gradient
  // No JavaScript override needed

  // Initial toast on load
  setTimeout(() => showToast('Welcome to Settings', 'info'), 500);
});