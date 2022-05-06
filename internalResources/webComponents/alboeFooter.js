const LS_DIRECTORIES_EXPANDED = 'directory-expanded-ids';
const ABLOE_FOOTER_STYLE = `
  footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    background: var(--color-black);
    color: var(--color-white);
    padding: var(--header-bar-top-bottom-padding);
    border-top: 4px solid var(--color-white);
    --line-color: var(--color-black);
  }

  nav {
    position: relative;
    padding: 24px 12px;
    margin: 12px 0;
    border: 4px solid var(--color-white);
    font-size: 1.25rem;
    font-weight: bold;
    width: calc(100% - 32px);
    max-width: calc(1000px - 32px);
  }

  .nav-title {
    position: absolute;
    background: var(--color-black);
    right: 50%;
    top: -2px;
    transform: translate(50%, -50%);
    padding: 0 8px;
    font-weight: bold;
  }

  ul {
    margin: 0;
    position: relative;
  }

  ul.collapsable {
    --collapsable-menu-height: 0;
    overflow-y: hidden;
    height: var(--collapsable-menu-height);
    transition: height .4s;
  }

  .drop-down-arrow {
    --arrow-color: var(--color-white);
    position: absolute;
    right: -12px;
    top: -4px;
    width: 48px;
    height: 24px;
    cursor: pointer;
  }

  .drop-down-arrow::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 12px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid var(--arrow-color);
    transition: all .4s;
    transform: rotate(0deg);
  }
  
  .drop-down-arrow.expanded::after {
    transform: rotate(180deg);
  }

  li {
    list-style-type: none;
    margin: 12px 0;
    position: relative;
  }

  a {
    color: var(--color-white);
  }

  a:hover {
    text-decoration: underline;
    color: var(--color-link);
  }

  .footer-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1000px;
  }

  dl {
    padding: 0;
    margin: 0;
    width: 100%;
  }

  dl div.box {
    display: flex;
    border: 2px solid var(--color-white);
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 12px;
  }

  dl div.icon-container {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  dl div dt {
    display: flex;
    background: var(--color-white);
    color: var(--color-black);
    padding: 6px;
    width: 100px;
  }

  dl div dd {
    padding: 6px;
    margin: 0;
  }

  .logo-container {
    --color-text: var(--color-white);
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 12px;
    gap: 24px;
  }

  .logo-container sheep-head-logo {
    width: 120px;
  }

  .icon-container {
    display: flex;
    gap: 12px;
  }

  .icon-container a {
    text-decoration: none;
  }

  @media only screen and (min-width: 600px) {
    footer {
      padding: var(--header-bar-top-bottom-padding) calc(var(--header-bar-top-bottom-padding) * 2);
    }

    .drop-down-arrow:hover {
      --arrow-color: var(--color-link);
    }
  }
`;

class AlboeFooter extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open'});

    const footer = document.createElement('footer');
    footer.classList.add('alboe-footer');

    const nav = document.createElement('nav');

    const navTitle = document.createElement('span');
    navTitle.innerText = 'Site Directory';
    navTitle.classList.add('nav-title');
    nav.appendChild(navTitle);

    const rootLink = document.createElement('a');
    rootLink.innerText = 'ALBOE.io';
    rootLink.setAttribute('href', '/');
    nav.appendChild(rootLink);

    const menu = document.createElement('ul');
    menu.classList.add('main');
    nav.appendChild(menu);

    const lsDirsExpanded = window.localStorage.getItem(LS_DIRECTORIES_EXPANDED);
    if (!lsDirsExpanded) {
      window.localStorage.setItem(LS_DIRECTORIES_EXPANDED, JSON.stringify(['0-dir']));
    }

    fetch('internalResources/siteStructure/siteStructure.json')
      .then(r => r.json())
      .then(j => {
        let expandedDirs = JSON.parse(window.localStorage.getItem(LS_DIRECTORIES_EXPANDED));

        j.directories.map((dir) => {
          const liEl = document.createElement('li');
          menu.appendChild(liEl);
          const aEl = document.createElement('a');
          aEl.innerText = dir.slug;
          aEl.setAttribute('href', dir.slug);
          aEl.setAttribute('title', dir.title);
          liEl.appendChild(aEl);
          if (dir.subs) {
            const subMenuEl = document.createElement('ul');
            subMenuEl.classList.add('collapsable');
            liEl.appendChild(subMenuEl);
            const expandArrow = document.createElement('span');
            expandArrow.classList.add('drop-down-arrow');
            expandArrow.addEventListener('click', () => {
              if (expandArrow.classList.contains('expanded')) {
                expandArrow.classList.remove('expanded');
                subMenuEl.style.setProperty('--collapsable-menu-height', '0');
                if (expandedDirs) {
                  expandedDirs = expandedDirs.filter((id) => id !== dir.id);
                  window.localStorage.setItem(LS_DIRECTORIES_EXPANDED, JSON.stringify(expandedDirs));
                }
              } else {
                expandArrow.classList.add('expanded');
                subMenuEl.style.setProperty('--collapsable-menu-height', subMenuEl.scrollHeight + 'px');
                if (expandedDirs) {
                  expandedDirs.push(dir.id);
                  window.localStorage.setItem(LS_DIRECTORIES_EXPANDED, JSON.stringify(expandedDirs));
                }
              }
            });
            liEl.appendChild(expandArrow);
            dir.subs.map(sub => {
              const subLiEl = document.createElement('li');
              const subAel = document.createElement('a');
              const slugParts = sub.slug.split('/');
              subAel.innerText = '/' + slugParts[slugParts.length - 1];
              subAel.setAttribute('href', sub.slug);
              subAel.setAttribute('title', sub.title);
              subLiEl.appendChild(subAel);
              subMenuEl.appendChild(subLiEl);
            });

            // start with first expanded
            // if (dir.id === '0-dir') {
            //   expandArrow.classList.add('expanded');
            //   subMenuEl.style.setProperty('--collapsable-menu-height', subMenuEl.scrollHeight + 'px');
            // }

            if (expandedDirs.includes(dir.id)) {
              expandArrow.classList.add('expanded');
              subMenuEl.style.setProperty('--collapsable-menu-height', subMenuEl.scrollHeight + 'px');
            }
          }
        })
      })
      .catch(console.error.bind(console));
      
    const footerInfo = document.createElement('div');
    footerInfo.classList.add('footer-info');
    
    const logoContainer = document.createElement('div');
    logoContainer.classList.add('logo-container');
    const alboeLogo = document.createElement('sheep-head-logo');
    logoContainer.appendChild(alboeLogo);

    const detailList = document.createElement('dl');
    addDetailListItem(detailList, 'Est.', '2022');
    addDetailListItem(detailList, 'Made in', 'Clallam County WA USA');
    addDetailListItem(detailList, 'License', 'MIT');
    const iconDiv = document.createElement('div');
    iconDiv.classList.add('icon-container');
    const gitHubA = document.createElement('a');
    gitHubA.setAttribute('href', 'https://github.com/jacobcovey/ALBOE.io');
    gitHubA.setAttribute('target', '_blank');
    const aMusicA = document.createElement('a');
    aMusicA.setAttribute('target', '_blank');
    aMusicA.setAttribute('href', 'https://music.apple.com/us/playlist/alboe-americana/pl.u-DdANNBetayekXJ');
    
    fetch('internalResources/assets/github.svg')
      .then(r => r.text())
      .then(inner => {
        gitHubA.innerHTML = inner;
      })
      .catch(console.error.bind(console));

    fetch('internalResources/assets/apple-music.svg')
      .then(r => r.text())
      .then(inner => {
        aMusicA.innerHTML = inner;
      })
      .catch(console.error.bind(console));

    iconDiv.appendChild(gitHubA);
    iconDiv.appendChild(aMusicA);

    logoContainer.appendChild(iconDiv);
    
    footerInfo.appendChild(detailList);
    footerInfo.appendChild(logoContainer);
      
    footer.appendChild(nav);
    footer.appendChild(footerInfo);
    
    const style = document.createElement('style');
    style.textContent = ABLOE_FOOTER_STYLE;

    shadow.appendChild(footer);
    shadow.appendChild(style);
  }
}

customElements.define('alboe-footer', AlboeFooter);

function addDetailListItem(dlEl, key, value) {
  const divEl = document.createElement('div');
  divEl.classList.add('box');
  const dtEl = document.createElement('dt');
  dtEl.innerText = key;
  const ddEl = document.createElement('dd');
  ddEl.innerText = value;

  divEl.appendChild(dtEl);
  divEl.appendChild(ddEl);

  dlEl.appendChild(divEl);
}