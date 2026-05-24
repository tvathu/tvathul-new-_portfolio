/* ==========================================================================
   MAIN CODE ENTRY POINT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initLucide();
  initCustomCursor();
  initNavbarMenu();
  initTiltEffect();
  initThreeJSBackgrounds();
});

/* ==========================================================================
   LUCIDE ICONS
   ========================================================================== */
function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ==========================================================================
   PRELOADER & INTERSECTION OBSERVER REVEAL
   ========================================================================== */
window.addEventListener('load', () => {
  const progressBar = document.getElementById('progress-bar');
  const preloader = document.getElementById('preloader');
  
  let width = 0;
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
        // Initialize Lenis scroll
        initLenisScroll();
        // Initialize scroll reveal triggers
        initScrollReveal();
      }, 600);
    } else {
      width += 10;
      progressBar.style.width = width + '%';
    }
  }, 40);
});

/* ==========================================================================
   LENIS SMOOTH SCROLLER
   ========================================================================== */
let lenis;
function initLenisScroll() {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

/* ==========================================================================
   SCROLL REVEAL TRIGGERS
   ========================================================================== */
function initScrollReveal() {
  // Simple intersection observer for fading elements up
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-fade');
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // If it's a heading text clip, reveal inner span
        if (entry.target.classList.contains('reveal-text')) {
          const innerSpans = entry.target.querySelectorAll('span');
          innerSpans.forEach(s => s.style.transform = 'translateY(0)');
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // Custom text span splitter for paragraph reveal
  const textRevealWords = document.querySelectorAll('.reveal-words');
  textRevealWords.forEach(container => {
    const text = container.textContent.trim();
    container.innerHTML = '';
    const words = text.split(' ');
    
    words.forEach(word => {
      const span = document.createElement('span');
      span.textContent = word + ' ';
      span.style.display = 'inline-block';
      container.appendChild(span);
    });

    const spans = container.querySelectorAll('span');
    
    // Add scroll listener (via Lenis or default window) to color words based on screen progression
    const handleWordScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the section is from center
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height * 0.5);
      
      if (progress > 0) {
        const totalSpans = spans.length;
        const activeCount = Math.floor(Math.min(1, Math.max(0, progress - 0.2) * 1.5) * totalSpans);
        
        spans.forEach((span, idx) => {
          if (idx < activeCount) {
            span.classList.add('active');
          } else {
            span.classList.remove('active');
          }
        });
      }
    };
    
    window.addEventListener('scroll', handleWordScroll);
    handleWordScroll();
  });
}

/* ==========================================================================
   CUSTOM CURSOR
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const glow = document.getElementById('cursor-glow');
  
  if (!cursor || !glow) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let glowX = 0, glowY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateCursor() {
    // Direct position for core cursor
    cursorX += (mouseX - cursorX) * 0.25;
    cursorY += (mouseY - cursorY) * 0.25;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Delayed smoothing for the ambient outer ring
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';

    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Add hover class to body when interacting with buttons, tags, or links
  const interactives = document.querySelectorAll('a, button, [data-tilt], .nav-logo, .marquee-tag, .contact-btn');
  interactives.forEach(item => {
    item.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    item.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ==========================================================================
   NAVIGATION MENU (OVERLAY & HAMBURGER)
   ========================================================================== */
function initNavbarMenu() {
  const toggleBtn = document.getElementById('menu-toggle');
  const menuOverlay = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  
  if (!toggleBtn || !menuOverlay) return;

  const toggleMenu = () => {
    toggleBtn.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    
    if (menuOverlay.classList.contains('active')) {
      // Prevent parent scroll
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
    } else {
      if (lenis) lenis.start();
      document.body.style.overflow = '';
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('active');
      menuOverlay.classList.remove('active');
      if (lenis) lenis.start();
      document.body.style.overflow = '';
    });
  });

  // Nav height shrink on scroll
  const nav = document.querySelector('.nav-container');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.padding = '10px 0';
      nav.style.background = 'rgba(6, 6, 8, 0.85)';
    } else {
      nav.style.padding = '0';
      nav.style.background = 'rgba(6, 6, 8, 0.4)';
    }
  });
}

/* ==========================================================================
   CARD TILT & LIGHT GLOW INTERACTION
   ========================================================================== */
function initTiltEffect() {
  const cards = document.querySelectorAll('[data-tilt]');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate normalized rotation coordinates (-10 to 10 degrees)
      const rotateX = ((y / rect.height) - 0.5) * -12;
      const rotateY = ((x / rect.width) - 0.5) * 12;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Update variables for background glow coordinate center
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   THREE.JS 3D FLOATING SCENES & STARFIELDS
   ========================================================================== */
function initThreeJSBackgrounds() {
  if (typeof THREE === 'undefined') return;

  // Track global mouse position for interactive camera drifts
  let mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) - 0.5;
    mouse.y = (e.clientY / window.innerHeight) - 0.5;
  });

  // 1. Hero Background (Abstract 3D particles + interactive floating glass torus knot)
  setupHeroScene(mouse);

  // 2. Reason 1: Torus Scene
  setupGeometryScene('canvas-3d-1', 'torus', 0x3a33ff, 0x00f2fe, mouse);

  // 3. Reason 2: Box Scene
  setupGeometryScene('canvas-3d-2', 'octahedron', 0x00f2fe, 0xa5b4fc, mouse);

  // 4. Reason 3: Icosahedron Scene
  setupGeometryScene('canvas-3d-3', 'icosahedron', 0xa5b4fc, 0x3a33ff, mouse);

  // 5. Project 1 Visual: Floating 3D Cylinder/Graph Ring
  setupGeometryScene('project-3d-1', 'cylinder', 0x3a33ff, 0x00f2fe, mouse);

  // 6. Project 2 Visual: Rotating Ring/YOLO scan sphere
  setupGeometryScene('project-3d-2', 'sphere', 0x00f2fe, 0xa5b4fc, mouse);
}

/* --- HERO SCENE --- */
function setupHeroScene(globalMouse) {
  const container = document.getElementById('hero-canvas');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.z = 25;

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 1. Particle Starfield
  const particleCount = 250;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 60;     // X
    positions[i + 1] = (Math.random() - 0.5) * 60; // Y
    positions[i + 2] = (Math.random() - 0.5) * 40; // Z
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0x3a33ff,
    size: 0.12,
    transparent: true,
    opacity: 0.6
  });
  
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // 2. Central Frosted Glass Torus Knot
  const knotGeom = new THREE.TorusKnotGeometry(4.5, 1.4, 120, 16);
  
  // Custom glassmorphic material using standard Physical Material properties
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1e1b4b,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.85,  // Glass transmission transparency
    thickness: 1.5,
    ior: 1.5,
    wireframe: false
  });

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });

  const torusKnot = new THREE.Mesh(knotGeom, glassMaterial);
  const torusWire = new THREE.Mesh(knotGeom, wireframeMaterial);
  torusKnot.add(torusWire); // Nest wireframe inside
  scene.add(torusKnot);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(10, 10, 10);
  scene.add(mainLight);

  const neonBlueLight = new THREE.PointLight(0x3a33ff, 3, 25);
  neonBlueLight.position.set(-10, -5, 5);
  scene.add(neonBlueLight);

  const neonCyanLight = new THREE.PointLight(0x00f2fe, 3, 25);
  neonCyanLight.position.set(10, 5, 5);
  scene.add(neonCyanLight);

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Rotate core shape
    torusKnot.rotation.x += 0.003;
    torusKnot.rotation.y += 0.005;

    // Subtle drift particles
    particles.rotation.y += 0.001;

    // Follow global mouse position with inertia
    camera.position.x += (globalMouse.x * 6 - camera.position.x) * 0.05;
    camera.position.y += (-globalMouse.y * 6 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };
  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

/* --- DETAILED 3D GEOMETRY SCENES --- */
function setupGeometryScene(containerId, shapeType, color1, color2, globalMouse) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 10;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Create Shape Geometry
  let geometry;
  switch (shapeType) {
    case 'torus':
      geometry = new THREE.TorusGeometry(2, 0.6, 16, 100);
      break;
    case 'octahedron':
      geometry = new THREE.OctahedronGeometry(2, 0);
      break;
    case 'icosahedron':
      geometry = new THREE.IcosahedronGeometry(2.1, 0);
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 32, 1, true);
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(2, 32, 32);
      break;
    default:
      geometry = new THREE.BoxGeometry(2, 2, 2);
  }

  // Physical Glass Material
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: color1,
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.8,
    thickness: 1.0,
    ior: 1.45,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.9
  });

  // Highlight neon lines
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: color2,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });

  const mesh = new THREE.Mesh(geometry, glassMaterial);
  const wire = new THREE.Mesh(geometry, wireMaterial);
  mesh.add(wire);
  scene.add(mesh);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(color1, 4, 15);
  fillLight.position.set(-5, -3, 3);
  scene.add(fillLight);

  const glowLight = new THREE.PointLight(color2, 4, 15);
  glowLight.position.set(5, 3, 3);
  scene.add(glowLight);

  // Local interaction variable to scale on hover
  let currentScale = 1.0;
  let targetScale = 1.0;
  
  container.addEventListener('mouseenter', () => {
    targetScale = 1.15;
  });
  
  container.addEventListener('mouseleave', () => {
    targetScale = 1.0;
  });

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Constant rotation values depending on shape
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.007;

    // Scale dampening transition
    currentScale += (targetScale - currentScale) * 0.1;
    mesh.scale.set(currentScale, currentScale, currentScale);

    // Minor drift reacting to global cursor movement
    mesh.position.x += (globalMouse.x * 1.5 - mesh.position.x) * 0.05;
    mesh.position.y += (-globalMouse.y * 1.5 - mesh.position.y) * 0.05;

    renderer.render(scene, camera);
  };
  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
