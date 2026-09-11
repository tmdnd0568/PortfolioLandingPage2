// ===== Unified Hero Role Synchronization Engine =====
const roleConfigs = [
  {
    id: 'uxui',
    leftText: 'UX/UI 디자이너',
    centerTitle: 'UX/UI',
    description: '사용자 경험을 설계합니다.',
    activeNodes: ['design'],
    activeLines: ['line-design']
  },
  {
    id: 'publisher',
    leftText: '웹 퍼블리셔',
    centerTitle: 'WEB<br>PUBLISHING',
    description: '디자인을 웹으로 구현합니다.',
    activeNodes: ['design', 'code'],
    activeLines: ['line-design', 'line-code']
  },
  {
    id: 'frontend',
    leftText: '프론트엔드 개발자',
    centerTitle: 'FRONT<br>END',
    description: '아이디어를 인터페이스로 구현합니다.',
    activeNodes: ['code'],
    activeLines: ['line-code']
  },
  {
    id: 'product',
    leftText: '프로덕트 디자이너',
    centerTitle: 'PRODUCT',
    description: '더 나은 경험을 만듭니다.',
    activeNodes: ['design', 'code', 'ai'],
    activeLines: ['line-design', 'line-code', 'line-ai'],
    isSpecial: true
  }
];

const roleEl = document.getElementById('roleText');
const sphereMain = document.getElementById('sphereMain');
const productSub = document.getElementById('productSub');
const sphereTagline = document.getElementById('sphereTagline');
const nodeCards = document.querySelectorAll('.node-card');
const connLines = document.querySelectorAll('.conn-line');
const centerSphere = document.getElementById('centerSphere');
const heroRight = document.getElementById('heroRight');
const orbitDotsLayer = document.getElementById('orbitDotsLayer');

let ri = 0, ci = 0, deleting = false;
let isUserHovering = false;
let activeTimeout = null;

function applyRoleDiagramState(roleIndex) {
  if (isUserHovering) return;
  const config = roleConfigs[roleIndex];
  if (!config) return;

  // 1. Fade transition for center text
  if (sphereMain) sphereMain.classList.add('fade-out');
  if (productSub) productSub.classList.add('fade-out');

  if (activeTimeout) clearTimeout(activeTimeout);
  activeTimeout = setTimeout(() => {
    if (sphereMain) {
      sphereMain.innerHTML = config.centerTitle;
      sphereMain.classList.remove('fade-out');
    }
    if (productSub) {
      productSub.textContent = config.description;
      productSub.classList.remove('fade-out');
    }
    if (sphereTagline) {
      sphereTagline.classList.toggle('highlight', !!config.isSpecial);
    }
  }, 160);

  // 2. Card & Line activation
  if (config.isSpecial) {
    // Special Product Designer Transition: Staggered Activation
    nodeCards.forEach(card => card.classList.remove('is-active', 'is-dimmed'));
    connLines.forEach(line => line.classList.remove('active', 'dimmed'));

    const order = ['design', 'code', 'ai'];
    order.forEach((nodeKey, idx) => {
      setTimeout(() => {
        if (isUserHovering) return;
        const card = document.querySelector(`.node-card[data-node="${nodeKey}"]`);
        const line = document.getElementById(`line-${nodeKey}`);
        if (card) card.classList.add('is-active');
        if (line) line.classList.add('active');
      }, idx * 110);
    });

    if (centerSphere) {
      centerSphere.classList.remove('pulse-scale');
      void centerSphere.offsetWidth;
      centerSphere.classList.add('pulse-scale');
    }
  } else {
    // Standard Role Activation
    nodeCards.forEach(card => {
      const nodeKey = card.getAttribute('data-node');
      if (config.activeNodes.includes(nodeKey)) {
        card.classList.add('is-active');
        card.classList.remove('is-dimmed');
      } else {
        card.classList.remove('is-active');
        card.classList.add('is-dimmed');
      }
    });

    connLines.forEach(line => {
      if (config.activeLines.includes(line.id)) {
        line.classList.add('active');
        line.classList.remove('dimmed');
      } else {
        line.classList.remove('active');
        line.classList.add('dimmed');
      }
    });
  }
}

function tick() {
  const config = roleConfigs[ri];
  const currentText = config.leftText;

  if (!deleting) {
    ci++;
    if (roleEl) roleEl.textContent = currentText.slice(0, ci);
    if (ci === currentText.length) {
      deleting = true;
      setTimeout(tick, 1800);
      return;
    }
  } else {
    ci--;
    if (roleEl) roleEl.textContent = currentText.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      ri = (ri + 1) % roleConfigs.length;
      applyRoleDiagramState(ri);
    }
  }
  setTimeout(tick, deleting ? 45 : 85);
}

// Initial state launch — clear any HTML default text before animating
if (roleEl) roleEl.textContent = '';
applyRoleDiagramState(0);
tick();

// ===== Hover Interaction Handler =====
const nodeHoverTextMap = {
  design: '사용자 경험을 설계합니다.',
  ai: '가능성을 확장합니다.',
  code: '아이디어를 구현합니다.'
};

nodeCards.forEach(card => {
  const nodeKey = card.getAttribute('data-node');
  const targetLine = document.getElementById(`line-${nodeKey}`);

  const handleMouseEnter = () => {
    isUserHovering = true;

    nodeCards.forEach(c => {
      if (c === card) {
        c.classList.add('is-active');
        c.classList.remove('is-dimmed');
      } else {
        c.classList.remove('is-active');
        c.classList.add('is-dimmed');
      }
    });

    connLines.forEach(line => {
      if (line === targetLine) {
        line.classList.add('active');
        line.classList.remove('dimmed');
      } else {
        line.classList.remove('active');
        line.classList.add('dimmed');
      }
    });

    if (productSub && nodeHoverTextMap[nodeKey]) {
      productSub.classList.add('fade-out');
      setTimeout(() => {
        productSub.textContent = nodeHoverTextMap[nodeKey];
        productSub.classList.remove('fade-out');
      }, 140);
    }
  };

  const handleMouseLeave = () => {
    isUserHovering = false;
    applyRoleDiagramState(ri);
  };

  card.addEventListener('mouseenter', handleMouseEnter);
  card.addEventListener('mouseleave', handleMouseLeave);
  card.addEventListener('touchstart', () => {
    handleMouseEnter();
    setTimeout(handleMouseLeave, 2500);
  }, { passive: true });
});

// ===== Mouse Parallax Effect =====
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroRight && !prefersReducedMotion) {
  heroRight.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 960) return;
    const rect = heroRight.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    targetX = (e.clientX - centerX) / (rect.width / 2);
    targetY = (e.clientY - centerY) / (rect.height / 2);

    targetX = Math.max(-1, Math.min(1, targetX));
    targetY = Math.max(-1, Math.min(1, targetY));
  });

  heroRight.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function animateParallax() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    const pxSphere = (currentX * 2.5).toFixed(2);
    const pySphere = (currentY * 2.5).toFixed(2);

    const pxCards = (currentX * 4.5).toFixed(2);
    const pyCards = (currentY * 4.5).toFixed(2);

    const pxOrbit = (currentX * 7.0).toFixed(2);
    const pyOrbit = (currentY * 7.0).toFixed(2);

    if (centerSphere) {
      centerSphere.style.setProperty('--px', `${pxSphere}px`);
      centerSphere.style.setProperty('--py', `${pySphere}px`);
    }

    nodeCards.forEach(card => {
      card.style.setProperty('--px', `${pxCards}px`);
      card.style.setProperty('--py', `${pyCards}px`);
    });

    if (orbitDotsLayer) {
      orbitDotsLayer.style.setProperty('--px', `${pxOrbit}px`);
      orbitDotsLayer.style.setProperty('--py', `${pyOrbit}px`);
    }

    requestAnimationFrame(animateParallax);
  }

}

// ===== Code Profile scroll-scrub =====
const codeLines = [
  [{ t: '// seungwoo.js', c: 'c-punc' }],
  [{ t: 'const ', c: 'c-key' }, { t: 'seungwoo', c: 'c-plain' }, { t: ' = {', c: 'c-punc' }],
  [{ t: '  name: ', c: 'c-plain' }, { t: '"길승우"', c: 'c-str' }, { t: ',', c: 'c-punc' }],
  [{ t: '  target: [', c: 'c-plain' }],
  [{ t: '    ', c: 'c-plain' }, { t: '"UX/UI Design"', c: 'c-str' }, { t: ',', c: 'c-punc' }],
  [{ t: '    ', c: 'c-plain' }, { t: '"Product Design"', c: 'c-str' }, { t: ',', c: 'c-punc' }],
  [{ t: '    ', c: 'c-plain' }, { t: '"Web Publishing"', c: 'c-str' }, { t: ',', c: 'c-punc' }],
  [{ t: '    ', c: 'c-plain' }, { t: '"Front-End Development"', c: 'c-str' }],
  [{ t: '  ],', c: 'c-plain' }],
  [{ t: '  skills: {', c: 'c-plain' }],
  [{ t: '    design: [', c: 'c-plain' }, { t: '"Figma"', c: 'c-str' }, { t: ', ', c: 'c-punc' }, { t: '"UI/UX"', c: 'c-str' }, { t: '],', c: 'c-punc' }],
  [{ t: '    web: [', c: 'c-plain' }, { t: '"HTML5"', c: 'c-str' }, { t: ', ', c: 'c-punc' }, { t: '"CSS3"', c: 'c-str' }, { t: '],', c: 'c-punc' }],
  [{ t: '    tools: [', c: 'c-plain' }, { t: '"GitHub"', c: 'c-str' }, { t: ', ', c: 'c-punc' }, { t: '"Vercel"', c: 'c-str' }, { t: ', ', c: 'c-punc' }, { t: '"Firebase"', c: 'c-str' }, { t: '],', c: 'c-punc' }],
  [{ t: '    ai: [', c: 'c-plain' }, { t: '"ChatGPT"', c: 'c-str' }, { t: ', ', c: 'c-punc' }, { t: '"Gemini"', c: 'c-str' }, { t: ', ', c: 'c-punc' }, { t: '"Claude"', c: 'c-str' }, { t: ', ', c: 'c-punc' }, { t: '"Antigravity"', c: 'c-str' }, { t: ']', c: 'c-punc' }],
  [{ t: '  },', c: 'c-plain' }],
  [{ t: '  strengths: [', c: 'c-plain' }],
  [{ t: '    ', c: 'c-plain' }, { t: '"Problem Solving"', c: 'c-str' }, { t: ',', c: 'c-punc' }],
  [{ t: '    ', c: 'c-plain' }, { t: '"Adaptability"', c: 'c-str' }, { t: ',', c: 'c-punc' }],
  [{ t: '    ', c: 'c-plain' }, { t: '"Collaboration"', c: 'c-str' }],
  [{ t: '  ],', c: 'c-plain' }],
  [{ t: '  direction: ', c: 'c-plain' }, { t: '"Design × Code × AI"', c: 'c-str' }],
  [{ t: '};', c: 'c-plain' }],
];

const codeBody = document.getElementById('codeBody');
if (codeBody) {
  codeBody.innerHTML = '';
  codeLines.forEach(line => {
    const div = document.createElement('div');
    div.className = 'code-line';
    line.forEach(seg => {
      const span = document.createElement('span');
      span.className = seg.c;
      span.textContent = seg.t;
      div.appendChild(span);
    });
    codeBody.appendChild(div);
  });
  const cursor = document.createElement('span');
  cursor.className = 'code-cursor';
  if (codeBody.lastElementChild) {
    codeBody.lastElementChild.appendChild(cursor);
  }
}

const lineEls = codeBody ? Array.from(codeBody.querySelectorAll('.code-line')) : [];
const aboutSection = document.getElementById('about');

function updateScrub() {
  if (!aboutSection || !lineEls.length) return;
  const rect = aboutSection.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  if (total <= 0) {
    lineEls.forEach(el => el.classList.add('show'));
    return;
  }

  const startOffset = window.innerHeight * 0.35;
  const currentOffset = -rect.top + startOffset;
  const scrubRange = total + startOffset;

  const progress = Math.min(1, Math.max(0, currentOffset / scrubRange));
  const visibleCount = Math.round(progress * lineEls.length);

  lineEls.forEach((el, i) => {
    el.classList.toggle('show', i < visibleCount);
  });
}

updateScrub();
window.addEventListener('scroll', updateScrub, { passive: true });
window.addEventListener('resize', updateScrub);

// ===== New Skills Section Manager =====
const skillsDetailData = {
  all: {
    badgeSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    eyebrow: 'ALL-ROUND OVERVIEW',
    title: '통합 역량 & 워크플로우',
    desc: '디자인부터 프론트엔드, 개발 도구 및 AI 활용까지 하나의 프로세스로 연결합니다.',
    isOverview: true,
    rows: [
      { id: 'design', iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`, title: 'Design', desc: 'UI/UX · Wireframe · Prototype', level: 90, labelText: '90%' },
      { id: 'frontend', iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, title: 'Front-End', desc: 'HTML · CSS · JavaScript · TypeScript · React · Vite', level: 85, labelText: '85%' },
      { id: 'dev', iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`, title: 'Development', desc: 'GitHub · Vercel · Firebase', level: 85, labelText: '85%' },
      { id: 'ai', iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`, title: 'AI Workflow', desc: 'ChatGPT · Claude · Gemini · Antigravity · Stitch', level: 90, labelText: '90%' }
    ]
  },
  design: {
    badgeSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    eyebrow: 'DESIGN',
    title: 'UI/UX 디자인',
    desc: '사용자의 흐름을 설계하고 이를 실제 인터페이스로 시각화합니다.',
    isOverview: false,
    rows: [
      { id: 'figma', icon: 'img/assect/figma.svg', name: 'Figma', desc: 'UI Design & Prototype', level: 90, labelText: '90%' },
      { id: 'uiux', icon: 'img/assect/figma.svg', name: 'UI/UX Design', desc: 'User Flow · Wireframe · Interaction', level: 85, labelText: '85%' },
      { id: 'prototype', icon: 'img/assect/figma.svg', name: 'Prototype', desc: 'Interactive Prototype · Component Design', level: 80, labelText: '80%' },
      { id: 'canva', icon: 'img/assect/canva.svg', name: 'Canva', desc: 'Design Tool', level: 70, labelText: '70%' }
    ]
  },
  frontend: {
    badgeSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    eyebrow: 'FRONT-END',
    title: '프론트엔드 개발',
    desc: '사용자와 가장 가까운 곳에서, 아이디어를 인터페이스로 구현합니다.',
    isOverview: false,
    rows: [
      { id: 'html5', icon: 'img/assect/html5.svg', name: 'HTML5', desc: 'Semantic Markup', level: 90, labelText: 'Proficient' },
      { id: 'css3', icon: 'img/assect/css3.svg', name: 'CSS3', desc: 'Responsive Layout', level: 80, labelText: 'Usable' },
      { id: 'javascript', icon: 'img/assect/javascript.svg', name: 'JavaScript', desc: 'DOM & Interaction', level: 65, labelText: 'Learning' },
      { id: 'typescript', icon: 'img/assect/typescript.svg', name: 'TypeScript', desc: 'Type-safe Development', level: 50, labelText: 'Learning' },
      { id: 'react', icon: 'img/assect/react.svg', name: 'React', desc: 'Component UI', level: 38, labelText: 'Learning' },
      { id: 'vite', icon: 'img/assect/vite.svg', name: 'Vite', desc: 'Build Tool', level: 45, labelText: 'Learning' }
    ]
  },
  dev: {
    badgeSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    eyebrow: 'DEVELOPMENT',
    title: '개발 & 배포',
    desc: '프로젝트의 코드 관리부터 서비스 배포까지 개발 흐름을 관리합니다.',
    isOverview: false,
    rows: [
      { id: 'github', icon: 'img/assect/github.svg', name: 'GitHub', desc: 'Version Control', level: 90, labelText: '90%' },
      { id: 'vercel', icon: 'img/assect/vercel.svg', name: 'Vercel', desc: 'Deployment', level: 85, labelText: '85%' },
      { id: 'firebase', icon: 'img/assect/firebase.svg', name: 'Firebase', desc: 'Auth & Backend', level: 75, labelText: '75%' },
      { id: 'vscode', icon: 'img/assect/vscode.svg', name: 'VS Code', desc: 'Development', level: 95, labelText: '95%' },
      { id: 'notion', icon: 'img/assect/notion.svg', name: 'Notion', desc: 'Documentation', level: 90, labelText: '90%' }
    ]
  },
  ai: {
    badgeSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#333644" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    eyebrow: 'AI WORKFLOW',
    title: 'AI 활용 워크플로우',
    desc: 'AI를 단순 코드 생성 도구가 아니라 기획, 개발, 분석 및 문제 해결 과정에 활용합니다.',
    isOverview: false,
    rows: [
      { id: 'chatgpt', icon: 'img/assect/chatgpt.svg', name: 'ChatGPT', desc: 'Coding & Debugging', level: 95, labelText: '95%' },
      { id: 'claude', icon: 'img/assect/claude.svg', name: 'Claude', desc: 'Coding Assistant', level: 90, labelText: '90%' },
      { id: 'gemini', icon: 'img/assect/gemini.svg', name: 'Gemini', desc: 'Research & API', level: 85, labelText: '85%' },
      { id: 'antigravity', icon: 'img/assect/antigravity.svg', name: 'Antigravity', desc: 'AI Coding', level: 80, labelText: '80%' },
      { id: 'stitch', icon: 'img/assect/stitch.svg', name: 'Stitch', desc: 'UI Prototyping', level: 85, labelText: '85%' }
    ]
  }
};

const skillsTabs = document.querySelectorAll('.skills-tab');
const toolCards = document.querySelectorAll('.tool-card');
const skillsDetailPanel = document.getElementById('skillsDetailPanel');
let highlightTimeout = null;

function renderSkillsDetail(categoryKey, targetSkillId = null) {
  if (!skillsDetailPanel) return;
  const data = skillsDetailData[categoryKey] || skillsDetailData.all;

  let bodyContentHtml = '';

  if (data.isOverview) {
    bodyContentHtml = `
      <div class="frontend-skills-list">
        ${data.rows.map(r => `
          <div class="frontend-progress-row ${targetSkillId === r.id ? 'highlighted' : ''}" data-skill-id="${r.id}">
            <div class="frontend-icon-box">${r.iconSvg}</div>
            <div class="skill-row-info">
              <span class="skill-row-name">${r.title}</span>
              <span class="skill-row-desc">${r.desc}</span>
            </div>
            <div class="skill-progress-track">
              <div class="skill-progress-fill" data-target="${r.level}" style="width: 0%;"></div>
            </div>
            <span class="skill-row-label">${r.labelText}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    bodyContentHtml = `
      <div class="frontend-skills-list">
        ${data.rows.map(r => `
          <div class="frontend-progress-row ${targetSkillId === r.id ? 'highlighted' : ''}" data-skill-id="${r.id}">
            <div class="frontend-icon-box">
              <img src="${r.icon}" alt="${r.name}">
            </div>
            <div class="skill-row-info">
              <span class="skill-row-name">${r.name}</span>
              <span class="skill-row-desc">${r.desc}</span>
            </div>
            <div class="skill-progress-track">
              <div class="skill-progress-fill" data-target="${r.level}" style="width: 0%;"></div>
            </div>
            <span class="skill-row-label">${r.labelText}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Smooth transition: opacity 0 -> 1, translateY 6px -> 0
  skillsDetailPanel.style.opacity = '0';
  skillsDetailPanel.style.transform = 'translateY(6px)';
  skillsDetailPanel.style.transition = 'opacity 250ms ease-out, transform 250ms ease-out';

  setTimeout(() => {
    skillsDetailPanel.innerHTML = `
      <div class="detail-header-block">
        <div class="detail-icon-badge">${data.badgeSvg}</div>
        <span class="detail-eyebrow">${data.eyebrow}</span>
        <h3 class="detail-main-title">${data.title}</h3>
        <p class="detail-description">${data.desc}</p>
      </div>

      <div class="detail-divider"></div>

      ${bodyContentHtml}

      <div class="detail-bottom-summary">
        <span class="summary-tag">DESIGN × CODE × AI</span>
        <p class="summary-text">Better Workflow. Better Experience.</p>
      </div>
    `;

    skillsDetailPanel.style.opacity = '1';
    skillsDetailPanel.style.transform = 'translateY(0)';

    // Remove highlight after 1.5 seconds if targetSkillId was highlighted
    if (targetSkillId) {
      if (highlightTimeout) clearTimeout(highlightTimeout);
      highlightTimeout = setTimeout(() => {
        const highlightedEl = skillsDetailPanel.querySelector('.highlighted');
        if (highlightedEl) highlightedEl.classList.remove('highlighted');
      }, 1500);
    }

    // Animate progress bars if present
    setTimeout(() => {
      const fills = skillsDetailPanel.querySelectorAll('.skill-progress-fill');
      fills.forEach(fill => {
        const target = fill.getAttribute('data-target');
        if (target) {
          fill.style.width = target + '%';
        }
      });
    }, 50);
  }, 200);
}

function filterToolCards(categoryKey) {
  toolCards.forEach((card, index) => {
    const cardCat = card.getAttribute('data-category');
    const matches = categoryKey === 'all' || cardCat === categoryKey;

    if (matches) {
      card.style.display = 'flex';
      card.style.pointerEvents = 'auto';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      }, index * 25);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.97)';
      card.style.pointerEvents = 'none';
      setTimeout(() => {
        if (card.style.opacity === '0') {
          card.style.display = 'none';
        }
      }, 250);
    }
  });
}

// Initial detail panel load
renderSkillsDetail('all');

// Bind Click and Accessibility events to Category Tabs
skillsTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const category = tab.getAttribute('data-tab');

    skillsTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    toolCards.forEach(c => c.classList.remove('is-selected'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    filterToolCards(category);
    renderSkillsDetail(category);
  });
});

// Bind Click Interaction to Left Tool Cards
toolCards.forEach(card => {
  card.addEventListener('click', () => {
    const category = card.getAttribute('data-category');
    const cardName = card.querySelector('.tool-card-name');
    const toolNameText = cardName ? cardName.textContent.toLowerCase().trim() : '';

    // Map tool name to ID
    let skillId = toolNameText.replace(/[^a-z0-9]/g, '');
    if (toolNameText.includes('figma')) skillId = 'figma';
    if (toolNameText.includes('html')) skillId = 'html5';
    if (toolNameText.includes('css')) skillId = 'css3';
    if (toolNameText.includes('javascript')) skillId = 'javascript';
    if (toolNameText.includes('typescript')) skillId = 'typescript';
    if (toolNameText.includes('vscode')) skillId = 'vscode';

    // Activate corresponding tab
    const targetCategory = (category && category !== 'etc') ? category : 'all';
    const targetTab = document.querySelector(`.skills-tab[data-tab="${targetCategory}"]`);

    skillsTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    if (targetTab) {
      targetTab.classList.add('active');
      targetTab.setAttribute('aria-selected', 'true');
    }

    toolCards.forEach(c => c.classList.remove('is-selected'));
    card.classList.add('is-selected');

    filterToolCards(targetCategory);
    renderSkillsDetail(targetCategory, skillId);
  });
});

// Image load error fallback for tool cards
document.querySelectorAll('.tool-card-icon img').forEach(img => {
  img.addEventListener('error', function () {
    const parent = this.parentElement;
    if (parent) {
      const altText = this.getAttribute('alt') || 'Icon';
      parent.innerHTML = `<span style="font-size:12px;font-weight:700;color:var(--accent,#7057ff);">${altText.slice(0, 3)}</span>`;
    }
  });
});

// ===== Skills Section Scroll Entrance Observer =====
const skillsSection = document.getElementById('skills');
if (skillsSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillsSection.classList.add('in-view');

        // Stagger entrance of visible tool cards
        const visibleCards = skillsSection.querySelectorAll('.tool-card');
        visibleCards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 40);
        });

        observer.unobserve(skillsSection);
      }
    });
  }, { threshold: 0.15 });

  observer.observe(skillsSection);
}

// ===== Projects Section Scroll Reveal Observer =====
const projectCards = document.querySelectorAll('.project-showcase-card');
if (projectCards.length > 0) {
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        projectObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  projectCards.forEach(card => projectObserver.observe(card));
}

// ===== Navigation Active State & ScrollSpy (Performance Optimized) =====
const navLinks = document.querySelectorAll('.nav-links a');
const navSections = document.querySelectorAll('section[id]');

// Ensure each nav link has a .nav-dot element
navLinks.forEach(link => {
  if (!link.querySelector('.nav-dot')) {
    const dot = document.createElement('span');
    dot.className = 'nav-dot';
    link.appendChild(dot);
  }
});

let isNavTicking = false;
let isUserNavClicking = false;
let navClickTimeout = null;
let cachedSectionPositions = [];

function updateCachedSectionPositions() {
  cachedSectionPositions = Array.from(navSections).map(section => ({
    id: section.getAttribute('id'),
    top: section.offsetTop,
    height: section.offsetHeight
  }));
}

function updateNavActiveState() {
  if (isUserNavClicking) return;

  let currentSectionId = '';
  const scrollPos = window.scrollY + 220;

  for (let i = 0; i < cachedSectionPositions.length; i++) {
    const s = cachedSectionPositions[i];
    if (scrollPos >= s.top && scrollPos < s.top + s.height) {
      currentSectionId = s.id;
    }
  }

  // Fallback for near bottom of page (Contact section)
  if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 60) {
    currentSectionId = 'contact';
  }

  if (currentSectionId) {
    navLinks.forEach(link => {
      const isTarget = link.getAttribute('href') === `#${currentSectionId}`;
      if (isTarget && !link.classList.contains('active')) {
        link.classList.add('active');
      } else if (!isTarget && link.classList.contains('active')) {
        link.classList.remove('active');
      }
    });
  }
}

function onNavScrollThrottled() {
  if (!isNavTicking) {
    requestAnimationFrame(() => {
      updateNavActiveState();
      isNavTicking = false;
    });
    isNavTicking = true;
  }
}

// Immediate feedback on link click & lock during smooth scroll
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    isUserNavClicking = true;
    if (navClickTimeout) clearTimeout(navClickTimeout);

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    navClickTimeout = setTimeout(() => {
      isUserNavClicking = false;
      updateNavActiveState();
    }, 800);
  });
});

updateCachedSectionPositions();
updateNavActiveState();

window.addEventListener('scroll', onNavScrollThrottled, { passive: true });
window.addEventListener('resize', () => {
  updateCachedSectionPositions();
  updateNavActiveState();
});
window.addEventListener('load', () => {
  updateCachedSectionPositions();
  updateNavActiveState();
});







