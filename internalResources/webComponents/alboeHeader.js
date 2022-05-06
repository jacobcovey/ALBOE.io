const cssTransitionTime = getComputedStyle(document.documentElement).getPropertyValue('--transition-time');
const CSS_TRANSITION_MS = cssTransitionTime ? Number(cssTransitionTime.substring(0, cssTransitionTime.length - 2)) : 400;
const LS_DARK = 'black-sheep-mode';

const STYLE_TEXT_CONTENT = `
  .top-bar {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 1;
    background: var(--color-white);
    color: var(--color-black);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--header-bar-top-bottom-padding);
    border-bottom: 2px solid transparent;
    transition: border-bottom .8s;
  }

  .top-bar.with-border {
    border-bottom: 2px solid var(--color-text);
  }

  .top-bar .logo-link {
    text-decoration: none;
    color: var(--color-black);
    font-size: 29px;
    font-weight: bold;
  }

  .top-bar .right-content {
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--header-bar-content-height);
  }

  .svg-btn svg {
    cursor: pointer;
    height: var(--header-bar-content-height);
    width: var(--header-bar-content-height);
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: var(--header-bar-content-height);
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-transition: var(--transition-time);
    transition: var(--transition-time);
    border-radius: 34px;
    border: 2px solid var(--color-black);
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 3px;
    background-color: var(--color-white);
    -webkit-transition: var(--transition-time);
    transition: var(--transition-time);
    border-radius: 50%;
    border: 2px solid var(--color-black);
  }

  input:checked + .slider {
    background-color: var(--color-black);
  }

  input:focus + .slider {
    box-shadow: 0 0 1px var(--color-black);
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  @media only screen and (min-width: 600px) {
    .top-bar {
      padding: var(--header-bar-top-bottom-padding) calc(var(--header-bar-top-bottom-padding) * 2);
    }
  }
`;

class AlboeHeader extends HTMLElement {
  constructor() {
    super();

    const switchInput = document.createElement('input');
    const lsDarkThemeValue = window.localStorage.getItem(LS_DARK);
    if (lsDarkThemeValue !== null) {
      const isDarkTheme = lsDarkThemeValue === 'true';
      setTheme(isDarkTheme);
      switchInput.checked = isDarkTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme(true);
      switchInput.checked = true;
    }

    const shadow = this.attachShadow({mode: 'open'});

    const header = document.createElement('header');
    header.setAttribute('class', 'top-bar');

    const logoLink = document.createElement('a');
    logoLink.innerText = 'ALBOE.io';
    logoLink.setAttribute('href', '/');
    logoLink.setAttribute('class', 'logo-link');

    header.appendChild(logoLink);

    const rightContent = document.createElement('div');
    rightContent.setAttribute('class', 'right-content');

    const wsButton = document.createElement('div');
    wsButton.setAttribute('class', 'svg-btn');
    wsButton.setAttribute('id', 'white-sheep-btn');

    const switchLabel = document.createElement('label');
    switchLabel.setAttribute('class', 'switch');
    switchLabel.setAttribute('for', 'theme-switch');

    switchInput.setAttribute('type', 'checkbox');
    switchInput.setAttribute('id', 'theme-switch');
    switchInput.setAttribute('name', 'theme-switch');
    switchInput.addEventListener('click', (e) => setTheme(e.target.checked, true));

    const switchSpan = document.createElement('span');
    switchSpan.setAttribute('class', 'slider');
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(switchSpan);

    const bsButton = document.createElement('div');
    bsButton.setAttribute('class', 'svg-btn');
    bsButton.setAttribute('id', 'black-sheep-btn');

    fetch('internalResources/assets/white-sheep.svg')
      .then(r => r.text())
      .then(inner => {
        wsButton.innerHTML = inner;
      })
      .catch(console.error.bind(console));

    fetch('internalResources/assets/black-sheep.svg')
      .then(r => r.text())
      .then(inner => {
        bsButton.innerHTML = inner;
      })
      .catch(console.error.bind(console));

    wsButton.addEventListener('click', () => {
      switchInput.checked = false;
      setTheme(false, true);
    });

    bsButton.addEventListener('click', () => {
      switchInput.checked = true;
      setTheme(true, true);
    });

    rightContent.appendChild(wsButton);
    rightContent.appendChild(switchLabel);
    rightContent.appendChild(bsButton);

    header.appendChild(rightContent);

    const style = document.createElement('style');
    style.textContent = STYLE_TEXT_CONTENT;

    shadow.appendChild(style);
    shadow.appendChild(header);

    // watch for user theme switching
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (window.localStorage.getItem(LS_DARK) === null) {
        if (event.matches === 'dark') {
          setTheme(true);
          switchInput.checked = true;
        } else {
          setTheme(false);
          switchInput.checked = false;
        }
      }
    });

    document.addEventListener('scroll', (e) => {
      if (window.pageYOffset > 2 && !header.classList.contains('with-border')) {
        header.classList.add('with-border');
      } else if (window.pageYOffset < 2 &&  header.classList.contains('with-border')) {
        header.classList.remove('with-border');
      }
    });
  }
}

customElements.define('alboe-header', AlboeHeader);

function setTheme(dark, setLocalStorage) {
  setLocalStorage && window.localStorage.setItem(LS_DARK, dark);
  const root = document.documentElement;
  let mainContentContainerCopy = null;
  if (setLocalStorage) {
    const mainContent = window.document.getElementsByClassName('main-content')[0];
    mainContentCopy = mainContent.cloneNode(true);
    mainContentContainerCopy = document.createElement('div');
    mainContentContainerCopy.classList.add('main-content-container');
    mainContentContainerCopy.appendChild(mainContentCopy);
    mainContentContainerCopy.classList.add('theme-transition');
    if (dark) {
      mainContentContainerCopy.classList.remove('white-sheep');
      mainContentContainerCopy.classList.add('black-sheep');
      mainContentCopy.classList.remove('white-sheep');
      mainContentCopy.classList.add('black-sheep');
      mainContentContainerCopy.classList.add('pre-bs');
    } else {
      mainContentContainerCopy.classList.add('white-sheep');
      mainContentContainerCopy.classList.remove('black-sheep');
      mainContentCopy.classList.add('white-sheep');
      mainContentCopy.classList.remove('black-sheep');
    }

    mainContent.parentNode.appendChild(mainContentContainerCopy);
  }

  if (dark) {
    setTimeout(() => {
      mainContentContainerCopy && mainContentContainerCopy.classList.add('bs');
      setTimeout(() => {
        root.style.setProperty('--color-primary', 'var(--color-light-gray)');
        root.style.setProperty('--color-background', 'var(--color-black)');
        root.style.setProperty('--color-text', 'var(--color-white)');
        setLocalStorage && mainContentContainerCopy.parentNode.removeChild(mainContentContainerCopy);
        const contentContainer = window.document.getElementsByClassName('main-content')[0];
        contentContainer.classList.remove('white-sheep');
        contentContainer.classList.add('black-sheep');
      }, CSS_TRANSITION_MS);
    }, 1);
  } else {
    setTimeout(() => {
      mainContentContainerCopy && mainContentContainerCopy.classList.add('ws') && mainContentContainerCopy.classList.add('white-sheep');;
      setTimeout(() => {
        root.style.setProperty('--color-primary', 'var(--color-dark-gray)');
        root.style.setProperty('--color-background', 'var(--color-white)');
        root.style.setProperty('--color-text', 'var(--color-black)');
        setLocalStorage && mainContentContainerCopy.parentNode.removeChild(mainContentContainerCopy);
        const contentContainer = window.document.getElementsByClassName('main-content')[0];
        contentContainer.classList.remove('black-sheep');
        contentContainer.classList.add('white-sheep');
      }, CSS_TRANSITION_MS);
    }, 1);
  }
}