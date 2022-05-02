const SHEEP_HEAD_LOGO_STYLE = `
  .sheep-head-logo {
    width: 66.66vw;
    --lettering-color: var(--color-text);
  }

  .sheep-head-logo g path {
    stroke: var(--color-text);
    stroke-width: 12;
    transform-origin: center;
  }

  .shake .sheep-head-logo g path {
    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

   .hide-lettering .sheep-head-logo g path.lettering {
    opacity: 0;
  }
  
  .sheep-head-logo g path.lettering {
    stroke: var(--lettering-color);
    opacity: 1;
    transition: opacity .15s;
  }

  @media only screen and (min-width: 600px) {
    .sheep-head-logo {
      width: 50vw;
    }
  }

  @keyframes shake {
    10%, 90% {
      transform: rotate(-4deg);
    }
    
    20%, 80% {
      transform: rotate(8deg);
    }
  
    30%, 50%, 70% {
      transform: rotate(-12deg);
    }
  
    40%, 60% {
      transform: rotate(12deg);
    }
  }
`;

const COLORS_ARR = [
  '#9400D3',
  '#4B0082',
  '#0000FF',
  '#00FF00',
  '#FFFF00',
  '#FF7F00',
  '#FF0000',
];

class SheepHeadLogo extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({mode: 'open'});

    const container = document.createElement('figure');
    const initialAnimation = this.hasAttribute('initial-animation');
    if (initialAnimation) {
      container.setAttribute('class', 'pre-animate hide-lettering');

      container.addEventListener('click', () => {
        container.classList.add('shake');
        container.classList.add('hide-lettering');
        setTimeout(() => {
          container.classList.remove('shake');
          
          const currentLetteringColor = getComputedStyle(container.firstElementChild).getPropertyValue('--lettering-color');
          const currentTextColor = getComputedStyle(container.firstElementChild).getPropertyValue('--color-text');
          if (currentLetteringColor.trim() == currentTextColor.trim()) {
            let randColorIndex = (Math.floor(Math.random() * COLORS_ARR.length) + 1) - 1;
            container.firstElementChild.style.setProperty('--lettering-color', COLORS_ARR[randColorIndex]);
          } else {
            container.firstElementChild.style.setProperty('--lettering-color', currentTextColor);
          }
          container.classList.remove('hide-lettering');
        }, 820);
      });
    }


    fetch('internalResources/assets/alboe.svg')
      .then(r => r.text())
      .then(inner => {
        container.innerHTML = inner;
        if (initialAnimation) {
          container.classList.remove('pre-animate');
          setTimeout(() => {
            container.classList.add('shake');

            setTimeout(() => {
              container.classList.remove('shake');
              container.classList.remove('hide-lettering');
            }, 820);

          }, 1000);
        }
      })
      .catch(console.error.bind(console));
    
    const style = document.createElement('style');
    style.textContent = SHEEP_HEAD_LOGO_STYLE;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}

customElements.define('sheep-head-logo', SheepHeadLogo);
