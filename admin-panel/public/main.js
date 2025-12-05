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
});
