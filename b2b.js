/**
 * B2B Landing Page - Interactive Logic
 * Handles QR Code Redirection, Parallax, Magnetic Effects, and Liquid Glass Shines.
 */

(function initB2B() {
    // 1. Compatibility Redirect for Old QR Codes
    // If the URL has ?code=, redirect to the new client page to maintain compatibility.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
        window.location.replace('/client/' + window.location.search);
        return; // Stop execution
    }

    document.addEventListener('DOMContentLoaded', () => {
        
        // 2. Scroll Reveal Animation (Intersection Observer)
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));

        // 3. Liquid Glass 3D Hover & Shine Effect
        const glassCards = document.querySelectorAll('.glass-card');
        
        glassCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Update shine center
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                
                // 3D Tilt calculation
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            });
        });

        // 4. Magnetic Buttons (Apple/Linear style)
        const magneticElements = document.querySelectorAll('.magnetic');
        
        magneticElements.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left) - rect.width / 2;
                const y = (e.clientY - rect.top) - rect.height / 2;
                
                // Move button slightly towards cursor
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                // Reset with a spring effect
                btn.style.transform = `translate(0px, 0px)`;
            });
        });

        // 5. Ambient Cursor Glow (Dynamic background tracker)
        const ambientGlow = document.createElement('div');
        ambientGlow.className = 'ambient-cursor-glow';
        document.body.appendChild(ambientGlow);

        document.addEventListener('mousemove', (e) => {
            // Smoothly move the ambient glow to follow the cursor
            ambientGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });

        // 6. Header Blur intensity on scroll
        const header = document.querySelector('.b2b-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    });
})();
