/* =========================================
   WebBros - Interaction Scripts
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* --- Mobile Navigation Toggle --- */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if(navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    /* --- Sticky Navbar Effect --- */
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- Active Navigation Link Update --- */
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    /* --- Scroll Animations (Intersection Observer) --- */
    // Select all items that should animate in
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const staggerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Group items inside .staggered-group to apply delays
    const staggeredGroups = document.querySelectorAll('.staggered-group');
    
    staggeredGroups.forEach(group => {
        const items = group.querySelectorAll('.staggered-item');
        items.forEach((item, index) => {
            // Apply staggered transition delay based on index
            // We ensure it doesn't get too long for large grids by capping or moduling
            const delay = (index % 6) * 0.1; // 0s, 0.1s, 0.2s... max 0.5s stagger
            item.style.transitionDelay = `${delay}s`;
            staggerObserver.observe(item);
        });
    });

    /* --- Form Submission to Backend API --- */
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            // Basic UI feedback
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            
            try {
                // Post data to our deployed Express server on Render
                const response = await fetch('https://webbros-backend-1.onrender.com/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
                    btn.style.background = '#10b981'; // emerald 500
                    btn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                    contactForm.reset();
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Submission Error:', error);
                btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error Sending';
                btn.style.background = '#ef4444'; // red 500
                btn.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
                alert('Oops! There was an issue sending your message. Please try again later.');
            } finally {
                // Reset button state after 3 seconds
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.boxShadow = '';
                    btn.style.opacity = '1';
                    btn.disabled = false;
                }, 4000);
            }
        });
    }
});
