/* Pappo Studios — shared behaviour: language, reveals, counters, tilt, menu. */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;

    /* ── Language (the <head> snippet applies the saved choice before paint) ── */
    function currentLang() { return root.getAttribute('data-lang') === 'he' ? 'he' : 'en'; }

    function setLang(lang) {
        var isHe = lang === 'he';
        root.setAttribute('lang', lang);
        root.setAttribute('dir', isHe ? 'rtl' : 'ltr');
        root.setAttribute('data-lang', lang);
        try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ }
        document.querySelectorAll('.lang-btn').forEach(function (b) {
            b.textContent = isHe ? 'EN' : 'עב';
            b.setAttribute('aria-label', isHe ? 'Switch to English' : 'עברו לעברית');
        });
        document.querySelectorAll('[data-title-en]').forEach(function (el) {
            document.title = el.getAttribute(isHe ? 'data-title-he' : 'data-title-en');
        });
        document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    }
    window.setLang = setLang;
    window.toggleLang = function () { setLang(currentLang() === 'en' ? 'he' : 'en'); };
    setLang(currentLang());
    document.querySelectorAll('.lang-btn').forEach(function (b) { b.addEventListener('click', window.toggleLang); });

    /* ── Mobile menu ── */
    var burger = document.querySelector('.burger');
    if (burger) {
        burger.addEventListener('click', function () {
            var open = document.body.classList.toggle('menu-open');
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
        });
    }

    /* ── Header state + scroll progress ── */
    var header = document.querySelector('.site-header');
    var bar = document.querySelector('.progress');
    var ticking = false;
    function onScroll() {
        var y = window.scrollY;
        if (header) header.classList.toggle('scrolled', y > 8);
        if (bar) {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
        }
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ── Split headlines into words ── */
    document.querySelectorAll('[data-split]').forEach(function (el) {
        el.classList.add('split');
        var i = 0;
        (function walk(node) {
            Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                if (child.nodeType === 3) {
                    var parts = child.textContent.split(/(\s+)/);
                    var frag = document.createDocumentFragment();
                    parts.forEach(function (p) {
                        if (!p) return;
                        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
                        var w = document.createElement('span'); w.className = 'w';
                        var inner = document.createElement('span'); inner.textContent = p;
                        inner.style.setProperty('--wi', i++);
                        w.appendChild(inner); frag.appendChild(w);
                    });
                    child.parentNode.replaceChild(frag, child);
                } else if (child.nodeType === 1 && child.tagName !== 'BR') {
                    if (child.classList.contains('en') || child.classList.contains('he')) i = 0;
                    walk(child);
                }
            });
        })(el);
    });

    /* ── Reveal on scroll ── */
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
        Array.prototype.forEach.call(group.children, function (c, idx) {
            c.classList.add('reveal');
            c.style.setProperty('--i', idx);
        });
    });
    var revealables = document.querySelectorAll('.reveal, [data-split], [data-count], [data-animate]');
    if ('IntersectionObserver' in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                activate(e.target);
                io.unobserve(e.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        revealables.forEach(function (el) { io.observe(el); });
    } else {
        revealables.forEach(activate);
    }
    function activate(el) {
        el.classList.add('visible');
        if (el.hasAttribute('data-split')) el.classList.add('go');
        if (el.hasAttribute('data-count')) countUp(el);
        if (el.hasAttribute('data-animate')) el.classList.add('in');
    }

    /* ── Count-up numbers ── */
    function countUp(el) {
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var fmt = function (n) { return Math.round(n).toLocaleString('en-US') + suffix; };
        if (reduceMotion) { el.textContent = fmt(target); return; }
        var start = null, dur = 1600;
        function step(t) {
            if (!start) start = t;
            var k = Math.min((t - start) / dur, 1);
            var eased = 1 - Math.pow(1 - k, 4);
            el.textContent = fmt(target * eased);
            if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ── Tilt (mouse only) ── */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('[data-tilt]').forEach(function (card) {
            var max = parseFloat(card.getAttribute('data-tilt')) || 6;
            card.addEventListener('pointermove', function (e) {
                var r = card.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - 0.5;
                var y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(900px) rotateX(' + (-y * max) + 'deg) rotateY(' + (x * max) + 'deg) translateY(-4px)';
                card.style.setProperty('--mx', (x + 0.5) * 100 + '%');
                card.style.setProperty('--my', (y + 0.5) * 100 + '%');
            });
            card.addEventListener('pointerleave', function () { card.style.transform = ''; });
        });

        /* Magnetic buttons */
        document.querySelectorAll('[data-magnetic]').forEach(function (b) {
            b.addEventListener('pointermove', function (e) {
                var r = b.getBoundingClientRect();
                b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.18 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.28 + 'px)';
            });
            b.addEventListener('pointerleave', function () { b.style.transform = ''; });
        });
    }

    /* ── Soft page transitions between local pages ── */
    if (!reduceMotion) {
        document.addEventListener('click', function (e) {
            var a = e.target.closest('a');
            if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            var href = a.getAttribute('href');
            if (!href || a.target === '_blank' || href.charAt(0) === '#' || /^(mailto:|tel:|https?:)/.test(href)) return;
            if (href.split('#')[0] === location.pathname.split('/').pop()) return;
            e.preventDefault();
            document.body.classList.add('leaving');
            setTimeout(function () { location.href = href; }, 200);
        });
        window.addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('leaving'); });
    }

    /* ── Footer year ── */
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
