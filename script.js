document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Smooth follow for outline
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navIcons = document.querySelector('.nav-icons');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navIcons.classList.toggle('active'); // Optional: show icons too or keep hidden
    });

    // Add active class style in CSS via JS if needed, or predefined keyframes
    // Let's inject a simple active style for the mobile menu if it wasn't in CSS
    const style = document.createElement('style');
    style.innerHTML = `
        @media (max-width: 768px) {
            .nav-links.active {
                display: flex;
                flex-direction: column;
                position: absolute;
                top: 80px;
                left: 0;
                width: 100%;
                background: rgba(0,0,0,0.95);
                padding: 2rem;
                text-align: center;
                animation: slideDown 0.3s ease forwards;
            }
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);


    // Scroll Reveal Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.product-card, .lifestyle-item, .section-title');

    // Add base style for these elements to animate from
    scrollElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Audio Player Logic
    const audio = document.getElementById('bg-music');
    const playBtn = document.getElementById('play-btn');
    const playerContainer = document.querySelector('.audio-player');
    const playIcon = playBtn.querySelector('i');

    audio.volume = 0.5; // Set a reasonable volume

    const updatePlayerState = (isPlaying) => {
        if (isPlaying) {
            playerContainer.classList.remove('paused');
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
            playBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSA';
        } else {
            playerContainer.classList.add('paused');
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            playBtn.innerHTML = '<i class="fas fa-play"></i> SOUNDTRACK';
        }
    };

    // Attempt to play immediately
    const tryPlayAudio = () => {
        audio.play().then(() => {
            updatePlayerState(true);
            // Remove global listeners if successful
            document.removeEventListener('click', tryPlayAudio);
            document.removeEventListener('touchstart', tryPlayAudio);
            document.removeEventListener('scroll', tryPlayAudio);
        }).catch(error => {
            console.log("Autoplay prevented. Waiting for interaction.");
            updatePlayerState(false);
        });
    };

    // Try immediately
    tryPlayAudio();

    // Fallback: Play on first interaction if autoplay was blocked
    document.addEventListener('click', tryPlayAudio, { once: true });
    document.addEventListener('touchstart', tryPlayAudio, { once: true });
    // Scroll might not be considered a user gesture for audio in some browsers, but worth a shot for "immersion"
    document.addEventListener('scroll', tryPlayAudio, { once: true });

    // Toggle button logic
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the global listener again if clicked
        if (audio.paused) {
            audio.play().then(() => updatePlayerState(true));
        } else {
            audio.pause();
            updatePlayerState(false);
        }
    });
});
