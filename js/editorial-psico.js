// Smooth scroll animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
    }
  });
}, observerOptions);

// Observe all sections for animation
document.querySelectorAll(".section").forEach((section) => {
  observer.observe(section);
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Parallax effect for floating elements
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const rate = scrolled * -0.5;

  document.querySelectorAll(".floating-circle").forEach((circle, index) => {
    const speed = 0.2 + index * 0.1;
    circle.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Enhanced hover effects for cards
document.querySelectorAll(".biomechanics-card, .phase-item").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-8px) scale(1.02)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
  });
});

// Progressive loading animation for sections
const sections = document.querySelectorAll(".section");
const animateOnScroll = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");

        // Animate child elements with delay
        const children = entry.target.querySelectorAll(
          ".biomechanics-card, .phase-item, .error-card"
        );
        children.forEach((child, index) => {
          setTimeout(() => {
            child.style.opacity = "1";
            child.style.transform = "translateY(0)";
          }, index * 100);
        });
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  }
);

sections.forEach((section) => {
  animateOnScroll.observe(section);

  // Set initial state for child elements
  const children = section.querySelectorAll(
    ".biomechanics-card, .phase-item, .error-card"
  );
  children.forEach((child) => {
    child.style.opacity = "0";
    child.style.transform = "translateY(20px)";
    child.style.transition = "all 0.6s ease-out";
  });
});

// Interactive scroll indicator
const scrollIndicator = document.querySelector(".scroll-indicator");
if (scrollIndicator) {
  scrollIndicator.addEventListener("click", () => {
    const firstSection = document.querySelector(".main-content");
    if (firstSection) {
      firstSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });

  // Hide scroll indicator after scrolling
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    if (scrolled > 100) {
      scrollIndicator.style.opacity = "0";
      scrollIndicator.style.pointerEvents = "none";
    } else {
      scrollIndicator.style.opacity = "1";
      scrollIndicator.style.pointerEvents = "auto";
    }
  });
}

// Dynamic gradient animation for hero accent
const heroAccent = document.querySelector(".hero-accent");
if (heroAccent) {
  let gradientPosition = 0;
  setInterval(() => {
    gradientPosition += 1;
    heroAccent.style.backgroundImage = `linear-gradient(${gradientPosition}deg, #ff69b4, #ff1493, #ff69b4)`;
    heroAccent.style.backgroundClip = "text";
    heroAccent.style.webkitBackgroundClip = "text";
  }, 100);
}

// Add loading states and transitions
document.addEventListener("DOMContentLoaded", () => {
  // Fade in body after load
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease-in";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);

  // Initialize any lazy-loaded content
  const imageElements = document.querySelectorAll(".image-placeholder");
  imageElements.forEach((img) => {
    img.addEventListener("click", () => {
      img.style.background = "linear-gradient(135deg, #ff69b4, #ff1493)";
      img.style.color = "white";
      img.innerHTML = "📸 Imagen cargada - Click para ver";
    });
  });
});

// Performance optimization - throttle scroll events
let ticking = false;
function updateScrollEffects() {
  // Parallax and other scroll effects here
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
});

// Add touch support for mobile devices
let touchStartY = 0;
document.addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchmove", (e) => {
  const touchY = e.touches[0].clientY;
  const touchDiff = touchStartY - touchY;

  // Add subtle parallax on mobile
  if (Math.abs(touchDiff) > 5) {
    document.querySelectorAll(".floating-circle").forEach((circle, index) => {
      const speed = 0.1 + index * 0.05;
      circle.style.transform = `translateY(${touchDiff * speed}px)`;
    });
  }
});
