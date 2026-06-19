document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. INTERACTIVE CANVAS PARTICLE SYSTEM
       ========================================================================== */
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    const mouse = {
        x: null,
        y: null,
        radius: 100
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    window.addEventListener('resize', resizeCanvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor(x, y, dx, dy, size, color) {
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.dy = dy;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
            if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;

            this.x += this.dx;
            this.y += this.dy;

            // Interactive mouse repulsion
            if (mouse.x !== null && mouse.y !== null) {
                let diffX = mouse.x - this.x;
                let diffY = mouse.y - this.y;
                let dist = Math.sqrt(diffX * diffX + diffY * diffY);
                if (dist < mouse.radius) {
                    let forceX = diffX / dist;
                    let forceY = diffY / dist;
                    let forceRatio = (mouse.radius - dist) / mouse.radius;
                    this.x -= forceX * forceRatio * 4;
                    this.y -= forceY * forceRatio * 4;
                }
            }
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        let numParticles = Math.floor((canvas.width * canvas.height) / 15000);
        if (numParticles > 80) numParticles = 80;
        if (numParticles < 25) numParticles = 25;

        for (let i = 0; i < numParticles; i++) {
            let size = Math.random() * 2 + 1;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let dx = (Math.random() * 0.35) - 0.17;
            let dy = (Math.random() * 0.35) - 0.17;
            let color = 'rgba(2, 132, 199, 0.18)'; // transparent blue
            if (Math.random() > 0.6) {
                color = 'rgba(6, 182, 212, 0.18)'; // transparent cyan
            }
            particlesArray.push(new Particle(x, y, dx, dy, size, color));
        }
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) {
                    opacityValue = 1 - (distance / 110);
                    ctx.strokeStyle = `rgba(2, 132, 199, ${opacityValue * 0.1})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    initParticles();
    animateParticles();

    /* ==========================================================================
       2. TAB CONTROLS (SKILLS & TOOLS SECTION)
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.skills-tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active classes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Set current active button
            button.classList.add('active');
            const targetPaneId = button.getAttribute('data-tab');
            const targetPane = document.getElementById(targetPaneId);
            if (targetPane) {
                // Force reflow to restart CSS animation
                void targetPane.offsetWidth;
                targetPane.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       3. RESPONSIVE MOBILE MENU
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggleBtn');
    const navLinksMenu = document.getElementById('navLinksMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navLinksMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinksMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinksMenu.classList.remove('active');
            });
        });
    }

    /* ==========================================================================
       4. ACTIVE NAVIGATION LINK ON SCROLL
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    const navObserverOptions = {
        root: null,
        threshold: 0.35,
        rootMargin: "-80px 0px 0px 0px"
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });

    /* ==========================================================================
       5. CONTACT FORM VALIDATION & SUBMISSION HANDLING
       ========================================================================== */
    const contactForm = document.getElementById('contactForm');
    const formSuccessMessage = document.getElementById('formSuccessMessage');
    const resetFormBtn = document.getElementById('resetFormBtn');

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');

    const emailError = document.getElementById('email-error');

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function checkInputs() {
        let isValid = true;

        if (nameInput.value.trim() === '') {
            nameInput.parentElement.parentElement.classList.add('error');
            isValid = false;
        } else {
            nameInput.parentElement.parentElement.classList.remove('error');
        }

        if (emailInput.value.trim() === '') {
            emailError.textContent = 'Email is required';
            emailInput.parentElement.parentElement.classList.add('error');
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            emailError.textContent = 'Please enter a valid email';
            emailInput.parentElement.parentElement.classList.add('error');
            isValid = false;
        } else {
            emailInput.parentElement.parentElement.classList.remove('error');
        }

        if (subjectInput.value.trim() === '') {
            subjectInput.parentElement.parentElement.classList.add('error');
            isValid = false;
        } else {
            subjectInput.parentElement.parentElement.classList.remove('error');
        }

        if (messageInput.value.trim() === '') {
            messageInput.parentElement.parentElement.classList.add('error');
            isValid = false;
        } else {
            messageInput.parentElement.parentElement.classList.remove('error');
        }

        return isValid;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (checkInputs()) {
                const submitBtn = document.getElementById('submitFormBtn');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Sending <i class="fas fa-spinner fa-spin"></i>';

                setTimeout(() => {
                    contactForm.style.display = 'none';
                    formSuccessMessage.classList.add('active');
                    
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    contactForm.reset();
                }, 1200);
            }
        });
    }

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            formSuccessMessage.classList.remove('active');
            contactForm.style.display = 'block';
        });
    }
});
