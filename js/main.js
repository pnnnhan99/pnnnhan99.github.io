(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  var navbar = document.getElementById('navbar');
  var progressBar = document.getElementById('progress-bar');
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('icon-open');
  var iconClose = document.getElementById('icon-close');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    navbar.classList.toggle('scrolled', y > 24);

    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menuBtn.addEventListener('click', function () {
    var open = mobileMenu.classList.toggle('hidden');
    iconOpen.classList.toggle('hidden', !open);
    iconClose.classList.toggle('hidden', open);
    menuBtn.setAttribute('aria-expanded', String(!open));
  });

  document.querySelectorAll('.mobile-link').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    var pos = window.scrollY + 140;
    var current = '';
    sections.forEach(function (section) {
      if (section.offsetTop <= pos) current = section.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - rect.left + 'px');
      card.style.setProperty('--my', e.clientY - rect.top + 'px');
    });
  });

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();

    var subject = encodeURIComponent('Portfolio contact from ' + name);
    var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');

    status.textContent = '✓ Opening your mail client…';
    status.classList.remove('hidden');
    window.location.href = 'mailto:hello@lonoup.com?subject=' + subject + '&body=' + body;
  });

  function initAnimations() {
    if (reduceMotion || typeof gsap === 'undefined') {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      document.querySelectorAll('.skill-bar').forEach(function (bar) {
        bar.style.width = bar.dataset.level;
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.7 })
      .from('.hero-line', { y: 34, opacity: 0, duration: 0.8, stagger: 0.12 }, '-=0.4')
      .from('.hero-visual', { y: 50, opacity: 0, scale: 0.96, duration: 1 }, '-=0.7');

    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      });
    });

    gsap.utils.toArray('.skill-bar').forEach(function (bar) {
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 92%',
        once: true,
        onEnter: function () {
          bar.style.width = bar.dataset.level;
        }
      });
    });
  }

  function initNodeCanvas() {
    var canvas = document.getElementById('node-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var nodes = [];
    var mouse = { x: -9999, y: -9999 };
    var raf = null;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      var count = Math.min(90, Math.floor((width * height) / 14000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: Math.random() * 1.6 + 0.8,
          hue: Math.random() > 0.72 ? '74, 222, 128' : '34, 211, 238'
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      var maxDist = width < 640 ? 110 : 150;

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        var dxm = mouse.x - n.x;
        var dym = mouse.y - n.y;
        var dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 140 && dm > 0.01) {
          n.x -= (dxm / dm) * 0.35;
          n.y -= (dym / dm) * 0.35;
        }

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x;
          var dy = n.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            var alpha = (1 - dist / maxDist) * 0.35;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = 'rgba(34, 211, 238, ' + alpha + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        var nearMouse = dm < 170;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + n.hue + ', ' + (nearMouse ? 0.95 : 0.65) + ')';
        ctx.fill();

        if (nearMouse) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.14)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      raf = window.requestAnimationFrame(draw);
    }

    window.addEventListener('resize', function () {
      window.cancelAnimationFrame(raf);
      resize();
      if (!reduceMotion) draw();
      else drawOnce();
    });

    function drawOnce() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + n.hue + ', 0.6)';
        ctx.fill();
      }
    }

    canvas.parentElement.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    resize();

    if (reduceMotion) {
      drawOnce();
    } else {
      draw();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        draw();
      }
    });
  }

  initAnimations();
  initNodeCanvas();
})();
