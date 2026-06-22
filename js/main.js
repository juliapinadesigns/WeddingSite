/* =========================================================
   Julia & Louis — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Nav: solid background on scroll ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu toggle ---- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Subtle hero parallax ---- */
  var heroMedia = document.getElementById("heroMedia");
  if (heroMedia && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroMedia.style.transform = "translateY(" + y * 0.18 + "px) scale(1.04)";
      }
    }, { passive: true });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal-on-scroll");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el, i) {
      // stagger cards within a grid
      if (el.classList.contains("card")) el.style.setProperty("--d", (i % 3) * 0.08 + "s");
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Marquee: continuous per-letter sine wave (Squarespace-style) ---- */
  var mqTrack = document.querySelector(".marquee__track");
  if (mqTrack) {
    var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Split every phrase span into per-letter char spans.
    var phrases = mqTrack.querySelectorAll("span");
    phrases.forEach(function (span) {
      var frag = document.createDocumentFragment();
      // Walk child nodes so we keep the <em> heart intact as one unit.
      Array.prototype.slice.call(span.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          // text node -> one char span per character
          node.textContent.split("").forEach(function (ch) {
            var c = document.createElement("span");
            var isSpace = /\s/.test(ch);
            c.className = isSpace ? "marquee__char marquee__space" : "marquee__char";
            c.textContent = isSpace ? "\u00A0" : ch;
            frag.appendChild(c);
          });
        } else if (node.nodeType === 1) {
          // element (the heart em) -> treat as a single wave unit
          node.classList.add("marquee__char");
          frag.appendChild(node);
        }
      });
      span.innerHTML = "";
      span.appendChild(frag);
    });

    var chars = Array.prototype.slice.call(mqTrack.querySelectorAll(".marquee__char"));

    function setupWave() {
      var halfWidth = mqTrack.scrollWidth / 2; // track holds the phrase set twice
      if (halfWidth <= 0) return;

      // Cache each char's center-x relative to the track.
      var trackLeft = mqTrack.getBoundingClientRect().left;
      var centers = chars.map(function (c) {
        var r = c.getBoundingClientRect();
        return (r.left - trackLeft) + r.width / 2;
      });

      var amp = 18; // wave height in px
      // Choose a wavelength that divides halfWidth so the loop is phase-continuous.
      var waves = Math.max(1, Math.round(halfWidth / 560));
      var wavelength = halfWidth / waves;
      var k = (Math.PI * 2) / wavelength;
      var speed = 55; // px per second

      var scrollX = 0;
      var last = performance.now();

      function frame(now) {
        var dt = (now - last) / 1000;
        last = now;
        scrollX -= speed * dt;
        if (scrollX <= -halfWidth) scrollX += halfWidth;

        mqTrack.style.transform = "translateX(" + scrollX + "px)";

        for (var i = 0; i < chars.length; i++) {
          var phase = (centers[i] + scrollX) * k;
          var y = amp * Math.sin(phase);
          var slope = amp * k * Math.cos(phase); // derivative -> tangent angle
          var deg = Math.atan(slope) * (180 / Math.PI);
          chars[i].style.transform =
            "translateY(" + y.toFixed(2) + "px) rotate(" + deg.toFixed(2) + "deg)";
        }
        rafId = requestAnimationFrame(frame);
      }
      var rafId = requestAnimationFrame(frame);
    }

    if (reduceMotion) {
      // Static gentle wave, no motion.
      mqTrack.style.transform = "translateX(0)";
    } else if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setupWave);
    } else {
      window.addEventListener("load", setupWave);
    }
  }

  /* ---- Countdown ---- */
  var grid = document.getElementById("countdownGrid");
  if (grid) {
    var target = new Date(grid.getAttribute("data-date")).getTime();
    var elDays = document.getElementById("cdDays");
    var elHours = document.getElementById("cdHours");
    var elMins = document.getElementById("cdMins");
    var elSecs = document.getElementById("cdSecs");
    var pad = function (n) { return String(n).padStart(2, "0"); };

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        elDays.textContent = "00"; elHours.textContent = "00";
        elMins.textContent = "00"; elSecs.textContent = "00";
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      elDays.textContent = d;
      elHours.textContent = pad(h);
      elMins.textContent = pad(m);
      elSecs.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---- Photo carousel ---- */
  var carousel = document.getElementById("carousel");
  if (carousel) {
    var track = document.getElementById("carouselTrack");
    var slides = Array.prototype.slice.call(track.querySelectorAll(".carousel__slide"));
    var dotsWrap = document.getElementById("carouselDots");
    var prevBtn = document.getElementById("carouselPrev");
    var nextBtn = document.getElementById("carouselNext");
    var index = 0;
    var count = slides.length;

    // build dots
    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.className = "carousel__dot" + (i === 0 ? " is-active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Photo " + (i + 1));
      b.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === index); });
    }
    function go(i) { index = (i + count) % count; render(); restart(); }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);

    // keyboard
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });

    // autoplay (pause on hover / reduced motion)
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var timer = null;
    function restart() {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(next, 5000);
    }
    carousel.addEventListener("mouseenter", function () { clearInterval(timer); });
    carousel.addEventListener("mouseleave", restart);

    // swipe
    var startX = 0, dragging = false;
    track.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX; dragging = true;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    }, { passive: true });

    render();
    restart();
  }
})();
