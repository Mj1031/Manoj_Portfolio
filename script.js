document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for fade-in elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                // Optional: stop observing once it has appeared
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // 2. Navbar effect on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.add('scrolled'); // always kept slightly visibly bordered if preferred, or remove
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 4. Antigravity Particle Animation
    const canvas = document.getElementById('antigravity-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = -1000;
        let mouseY = -1000;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }

        window.addEventListener('resize', resizeCanvas);

        // Track Mouse across entirety of window map
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Tiny nodes
                this.size = Math.random() * 1.5 + 0.5;
                // Faster straight line movement
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.speedY = (Math.random() - 0.5) * 1.5; 
                
                // Assign blue or red color
                const isBlue = Math.random() > 0.5;
                this.color = isBlue ? 'rgba(41, 151, 255, 0.8)' : 'rgba(255, 69, 58, 0.8)'; // Apple-style Blue and Red
                this.lineColor = isBlue ? 'rgba(41, 151, 255, ' : 'rgba(255, 69, 58, ';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse interaction - repel
                if (mouseX > -500 && mouseY > -500) {
                    const dx = mouseX - this.x;
                    const dy = mouseY - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const interactionRadius = 150;

                    if (distance < interactionRadius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (interactionRadius - distance) / interactionRadius;
                        
                        this.x -= forceDirectionX * force * 3;
                        this.y -= forceDirectionY * force * 3;
                    }
                }

                // Bounce off edges to stay bounded in network
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Substantially increase density
            const particleCount = Math.min(Math.floor(canvas.width * 0.15), 250);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                // Draw connecting lines (The Constellation / Network effect)
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 130) {
                        ctx.beginPath();
                        
                        // Highlight thread between red and blue dots
                        const isDifferentColor = (particles[i].color !== particles[j].color);
                        
                        if (isDifferentColor) {
                            // Brighter, thicker "highlighted" thread for Blue-Red connections
                            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - distance/500})`; // Whiter/Brighter
                            ctx.lineWidth = 1.2;
                        } else {
                            // Standard color-matched thin thread
                            ctx.strokeStyle = `${particles[i].lineColor}${0.15 - distance/1000})`;
                            ctx.lineWidth = 0.5;
                        }

                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }

        resizeCanvas();
        animateParticles();
    }

    // 5. GitHub API Integration for Projects
    const githubContainer = document.getElementById('github-projects-container');
    if (githubContainer) {
        const username = 'Mj1031';
        
        // Add a loading state
        githubContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 40px;">Fetching live projects from GitHub...</p>';

        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch from GitHub');
                return response.json();
            })
            .then(repos => {
                githubContainer.innerHTML = '';
                
                // Filter out forks if desired, or just show all
                const publicRepos = repos.filter(repo => !repo.fork);
                
                if (publicRepos.length === 0) {
                    githubContainer.innerHTML = '<p style="color: var(--text-muted);">No public repositories found.</p>';
                    return;
                }

                // Add a sub-header for GitHub Live Projects
                const header = document.createElement('h3');
                header.style.marginTop = '60px';
                header.innerHTML = 'GitHub Repositories <span style="font-size: 0.5em; vertical-align: middle; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 20px; font-weight: 400; font-family: -apple-system, sans-serif;">Live</span>';
                githubContainer.appendChild(header);

                publicRepos.forEach(repo => {
                    const repoElements = document.createElement('div');
                    repoElements.className = 'content-block fade-in appear'; // auto-appear since it's loaded dynamically
                    
                    const name = document.createElement('h4');
                    // Format repo name slightly better depending on dashes
                    name.textContent = repo.name.replace(/-/g, ' ').replace(/_/g, ' ');
                    name.style.textTransform = 'capitalize';

                    const language = document.createElement('h5');
                    language.textContent = repo.language || 'Documentation / Multiple';

                    const description = document.createElement('p');
                    description.textContent = repo.description || 'No description provided on GitHub.';

                    const linkDiv = document.createElement('div');
                    linkDiv.style.marginTop = '16px';
                    
                    const link = document.createElement('a');
                    link.href = repo.html_url;
                    link.target = '_blank';
                    link.className = 'btn secondary';
                    link.style.padding = '8px 20px';
                    link.style.fontSize = '14px';
                    link.style.border = '1px solid var(--text-color)';
                    link.style.color = 'var(--text-color)';
                    link.textContent = 'View Repository ↗';
                    
                    linkDiv.appendChild(link);

                    repoElements.appendChild(name);
                    repoElements.appendChild(language);
                    repoElements.appendChild(description);
                    repoElements.appendChild(linkDiv);

                    githubContainer.appendChild(repoElements);
                });
            })
            .catch(error => {
                console.error('Error fetching GitHub repos:', error);
                githubContainer.innerHTML = '<p style="color: var(--rose);">Could not load GitHub projects at this time.</p>';
            });
    }
});
