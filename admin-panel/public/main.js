document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navWrapper = document.querySelector('.nav-wrapper');

    if (mobileMenuBtn && navWrapper) {
        mobileMenuBtn.addEventListener('click', () => {
            navWrapper.classList.toggle('active');

            // Optional: Toggle icon between bars and times (X)
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (navWrapper.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking a link
        const navLinks = navWrapper.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navWrapper.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // Carousel Logic
    const carousel = document.querySelector('.suggestions-carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (carousel && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        });

        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: -320,
                behavior: 'smooth'
            });
        });
    }

    // Parallax Effect
    // Parallax Effect
    const hero = document.querySelector('.hero-bg');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const rate = 0.5;
            // "right" is the horizontal position from CSS.
            // "center" (50%) is the initial vertical position.
            // We adding the scroll offset to move it down/up relative to viewport.
            // If we scroll down (scrolled increases), we want the background to move UP slower than content.
            // Content moves up by 'scrolled'.
            // To make bg move up slower, we effectively shift it DOWN relative to container?
            // Wait, background-attachment: scroll means it moves WITH the container.
            // So if I scroll down 100px, the bg moves up 100px relative to screen.
            // I want it to move up only 50px.
            // So I need to push it DOWN by 50px relative to container.
            // So + (scrolled * rate).
            hero.style.backgroundPosition = `right calc(50% + ${scrolled * rate}px)`;
        });
    }

    // Dynamic Navbar Background
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
});
