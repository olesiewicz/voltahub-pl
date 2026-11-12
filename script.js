'use strict';

const header = document.querySelector('.header');
const menuButton = header?.querySelector('.menu-toggle');
const menu = header?.querySelector('nav');
if (menuButton && menu) {
  function setMenu(open) {
    menu.toggleAttribute('data-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  }

  header.classList.add('menu-enhanced');
  menuButton.hidden = false;
  menuButton.addEventListener('click', () => setMenu(!menu.hasAttribute('data-open')));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.hasAttribute('data-open')) {
      setMenu(false);
      menuButton.focus();
    }
  });
  menu.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !menu.hasAttribute('data-open')) return;

    const section = link.hash && link.pathname === location.pathname
      ? document.getElementById(link.hash.slice(1))
      : null;
    setMenu(false);
    if (section) {
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
  });
}

const carousel = document.querySelector('.carousel');
if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  const caption = carousel.querySelector('.carousel-caption');
  let index = 0;

  function move(step) {
    slides[index].hidden = true;
    index = (index + step + slides.length) % slides.length;
    const active = slides[index];
    active.hidden = false;
    caption.textContent = `${active.dataset.caption} [${index + 1}/${slides.length}]`;
  }

  carousel.querySelector('[data-carousel="prev"]').addEventListener('click', () => move(-1));
  carousel.querySelector('[data-carousel="next"]').addEventListener('click', () => move(1));
  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
}

for (const button of document.querySelectorAll('[data-contact-type]')) {
  button.addEventListener('click', () => {
    const group = button.closest('.reveal');
    const isPhone = button.dataset.contactType === 'tel';
    const value = isPhone
      ? button.dataset.contactFirst
      : `${button.dataset.contactFirst}@${button.dataset.contactLast}`;
    const link = document.createElement('a');
    link.textContent = value;
    link.target = '_blank';
    link.rel = 'noopener';
    link.href = isPhone ? `tel:${value.replace(/\s/g, '')}` : `mailto:${value}`;
    const output = group.querySelector('.revealed');
    output.replaceChildren(link);
    output.hidden = false;
    group.querySelector('.mask').hidden = true;
    button.setAttribute('aria-expanded', 'true');
    button.hidden = true;
    link.focus();
  });
}

const lightbox = document.querySelector('.lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const thumbnails = Array.from(document.querySelectorAll('[data-lightbox]'));
  const image = lightbox.querySelector('img');
  const caption = lightbox.querySelector('figcaption');
  const close = lightbox.querySelector('[data-lightbox-action="close"]');
  let active = 0;
  let opener;

  function show(index) {
    active = (index + thumbnails.length) % thumbnails.length;
    const thumbnail = thumbnails[active].querySelector('img');
    image.src = thumbnail.src;
    image.alt = thumbnail.alt;
    const label = thumbnails[active].closest('figure').querySelector('figcaption').textContent;
    caption.textContent = `${label} [${active + 1}/${thumbnails.length}]`;
  }

  thumbnails.forEach((button, index) => {
    button.addEventListener('click', () => {
      opener = button;
      show(index);
      lightbox.showModal();
      close.focus();
    });
  });
  lightbox.addEventListener('click', event => {
    const action = event.target.closest('[data-lightbox-action]')?.dataset.lightboxAction;
    if (event.target === lightbox || action === 'close') lightbox.close();
    if (action === 'prev') show(active - 1);
    if (action === 'next') show(active + 1);
  });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') show(active - 1);
    if (event.key === 'ArrowRight') show(active + 1);
  });
  lightbox.addEventListener('close', () => opener?.focus());
}
