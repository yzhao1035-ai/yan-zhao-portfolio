import { useEffect, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Asterisk, AtSign, QrCode, X } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import RippleDistortion from './RippleDistortion';
import TargetCursor from './TargetCursor';
import Iridescence from './Iridescence';

const BASE_URL = import.meta.env.BASE_URL;
const asset = (path) => `${BASE_URL}${path.replace(/^\/+/, '')}`;
const projectUrl = (slug) => `${BASE_URL}?project=${encodeURIComponent(slug)}`;

const projects = [
  {
    id: '01',
    slug: 'skin-center',
    name: '皮肤中心体验改版',
    type: 'CONSUMER PRODUCT / COMMERCIAL EXPERIENCE',
    description: '围绕年轻用户的个性化装扮需求，贯通皮肤发现、选择与设置流程。',
    metric: '20',
    metricUnit: 'pt',
    metricLabel: '整体设置率提升',
    theme: 'skin',
    tag: 'ALIPAY · 2025',
    roles: ['视觉体验设计', '交互设计'],
    fullName: '支付宝端皮肤中心体验改版',
    challenge: '用户需要快速看懂皮肤内容、判断是否喜欢并完成设置；内容层级、权益表达或反馈不清楚，都可能让用户在完成前离开。',
    approach: '以“发现—理解—选择—设置”为主线，强化皮肤内容呈现与操作状态反馈，让个性表达和商业化权益在同一条体验路径中自然发生。',
    result: '2025 年 12 月、100 万用户范围内：整体设置率由 20% 升至 40%（增加 20 个百分点），整体点击率提升 16%，有效皮肤设置 LT30 提升 3%。订单转化率提升 2.4% 来自灰度阶段。项目已上线，后期下线。',
    gallery: [3, 4, 5, 6, 7, 8, 9, 10].map((number) => asset(`assets/projects/skin/${number}.jpg`)),
    galleryTotal: 10,
    heroImage: asset('assets/portfolio/skin-center.jpg'),
    facts: [['项目类型', '消费端产品 / 商业化体验'], ['个人职责', '视觉体验设计、交互设计']],
  },
  {
    id: '02',
    slug: 'ai-skin-studio',
    name: '皮肤小窝',
    type: 'AI PRODUCT / 0—1 EXPERIENCE',
    description: '从照片到专属数字皮肤，探索如何让 AI 生成过程清晰、轻松、可信。',
    metric: '0—1',
    metricLabel: 'AI 定制产品完整体验',
    theme: 'nest',
    tag: 'AI MINI PROGRAM',
    roles: ['产品规划', '交互设计', '视觉设计'],
    fullName: 'AI 皮肤定制小程序「皮肤小窝」',
    challenge: '上传照片与 AI 生成会带来输入成本、结果不确定和隐私顾虑。用户需要知道如何操作、会得到什么，以及照片将如何使用。',
    approach: '参与 0—1 产品规划，建立照片上传、类型选择、风格选择和生成结果的核心流程；用上传指引、隐私说明、示例与过程反馈降低使用门槛。',
    result: '小程序曾上线，后期已下线，目前没有可公开的独立业务数据。项目沉淀了从产品规划到交互、视觉落地的完整 AI 产品实践。',
    gallery: [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13].map((number) => asset(`assets/projects/ai-studio/${number}.jpg`)),
    galleryTotal: 13,
    heroImage: asset('assets/portfolio/ai-skin-studio.jpg'),
    facts: [['项目类型', 'AI 产品 / 小程序 / 0—1 体验'], ['个人职责', '产品规划、交互设计、视觉设计']],
  },
  {
    id: '03',
    slug: 'marketing-visuals',
    name: '营销视觉页面设计',
    type: 'MARKETING VISUAL / AIGC ART DIRECTION',
    description: '以支付国际版 29 城文旅内容为代表，探索城市文化的系列化视觉表达。',
    metric: '29',
    metricLabel: '座城市 · 主题插画',
    theme: 'cities',
    tag: 'ALIPAY+ · MARKETING',
    roles: ['营销视觉设计', '页面视觉设计', 'AIGC 图片生成'],
    fullName: '营销视觉页面设计',
    challenge: '城市文旅内容既要呈现地标与文化特色，也要在多城市、多营销场景中维持系列一致性。',
    approach: '将地标、文化元素、视角、风格和氛围拆解为可组合的生成方向，通过 AIGC 视觉探索、筛选和调整建立统一的系列表达。',
    result: '29 城插画用于支付国际版首页及城市开放后的旅游景点营销内容，体现营销视觉设计、AIGC 探索与系列化审美控制。',
    gallery: [2, 3, 4, 5, 6].map((number) => asset(`assets/projects/marketing/${number}.jpg`)),
    galleryTotal: 6,
    heroImage: asset('assets/portfolio/marketing-visuals.jpg'),
    facts: [['项目类型', '营销视觉 / 活动页面 / AIGC'], ['个人职责', '营销视觉、页面视觉、AIGC 图片生成'], ['代表内容', '支付国际版 29 城文旅主题插画']],
  },
  {
    id: '04',
    slug: 'b2b-dashboard',
    name: 'B 端后台体验设计',
    type: 'B2B PRODUCT / DASHBOARD EXPERIENCE',
    description: 'B 端后台相关设计素材，呈现数据分析与业务管理界面探索。',
    metric: 'B端',
    metricLabel: '后台设计素材',
    theme: 'b2b',
    tag: 'B2B · PRODUCT DESIGN',
    roles: ['界面设计'],
    fullName: 'B 端后台体验设计',
    challenge: '项目背景、目标用户与业务问题尚未整理，暂不展示未经确认的信息。',
    approach: '本页仅呈现现有的后台设计画板素材。',
    result: '具体项目职责、设计方案与结果数据待补充。',
    gallery: [2, 3, 4].map((number) => asset(`assets/projects/b2b/${number}.jpg`)),
    galleryTotal: 4,
    heroImage: asset('assets/portfolio/b2b-dashboard.jpg'),
    facts: [['项目类型', 'B 端后台体验设计'], ['可见内容', '现有设计画板素材'], ['项目说明', '背景、职责与结果待补充']],
  },
];

const capabilities = [
  ['01', '体验策略', '从用户需求与业务目标出发，梳理问题、提炼洞察并定义方向。', 'EXPERIENCE STRATEGY'],
  ['02', '消费端产品设计', '熟悉场景拆解、信息架构、交互设计、视觉设计与上线迭代。', 'CONSUMER PRODUCT'],
  ['03', '商业化体验', '连接用户价值与业务目标，通过清晰指标观察设计效果。', 'COMMERCIAL EXPERIENCE'],
  ['04', 'AI 产品设计', '具备从 0 到 1 规划 AI 定制体验的实践，关注信任与结果可用性。', 'AI PRODUCT'],
  ['05', 'AIGC 营销视觉', '探索生成式视觉并建立兼具创意与一致性的系列化表达。', 'AIGC VISUAL'],
  ['06', '协作与落地', '与产品、研发协作，将设计方案转化为可执行的产品体验。', 'COLLABORATION'],
];

function SectionLabel({ number, children }) {
  return <div className="section-label"><span>{number}</span><span className="label-line" /><span>{children}</span></div>;
}

function ContactModal({ onClose }) {
  const [wechatCopied, setWechatCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  const copyWechat = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText('haliaseyou');
      copied = true;
    } catch {
      const input = document.createElement('textarea');
      input.value = 'haliaseyou';
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      copied = document.execCommand('copy');
      input.remove();
    }
    if (copied) {
      setWechatCopied(true);
      window.setTimeout(() => setWechatCopied(false), 1800);
    }
  };

  return (
    <div className="contact-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="wechat-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭"><X size={19} /></button>
        <span className="modal-kicker">WECHAT · CONTACT</span>
        <h2 id="wechat-title">喜欢就联系我</h2>
        <div className="qr-placeholder"><img className="wechat-qr" src={asset('assets/weixin.png')} alt="赵艳的微信二维码" /><p>微信扫码添加</p></div>
        <div className="wechat-id"><span>微信号</span><strong>haliaseyou</strong></div>
        <button className="copy-wechat" type="button" onClick={copyWechat}>{wechatCopied ? '已复制' : '复制微信号'}</button>
      </section>
    </div>
  );
}

function HeroFluid({ heroRef }) {
  const fluidRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const pointerX = useSpring(useMotionValue(0), { stiffness: 70, damping: 22, mass: 0.65 });
  const pointerY = useSpring(useMotionValue(0), { stiffness: 70, damping: 22, mass: 0.65 });
  const rotateX = useSpring(useMotionValue(0), { stiffness: 65, damping: 24, mass: 0.7 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 65, damping: 24, mass: 0.7 });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, -34]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.68, 1], [1, 0.88, 0]);

  useEffect(() => {
    const element = fluidRef.current;
    if (!element || reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const onPointerMove = (event) => {
      const bounds = element.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      pointerX.set(x * 7);
      pointerY.set(y * 7);
      rotateX.set(-y * 2.4);
      rotateY.set(x * 2.4);
    };
    const resetPointer = () => {
      pointerX.set(0);
      pointerY.set(0);
      rotateX.set(0);
      rotateY.set(0);
    };

    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerleave', resetPointer);
    return () => {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', resetPointer);
    };
  }, [pointerX, pointerY, reduceMotion, rotateX, rotateY]);

  return (
    <motion.div ref={fluidRef} className="hero-fluid-wrap" style={{ y: reduceMotion ? 0 : scrollY, opacity: reduceMotion ? 1 : scrollOpacity }}>
      <motion.div className="hero-fluid-parallax" style={{ x: reduceMotion ? 0 : pointerX, y: reduceMotion ? 0 : pointerY, rotateX: reduceMotion ? 0 : rotateX, rotateY: reduceMotion ? 0 : rotateY }}>
        <motion.div className="hero-fluid-entry" initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
          <RippleDistortion
            className="hero-fluid"
            src={asset('assets/portfolio/home-element.png')}
            brushSize={150}
            strength={0.2}
            swirl={1}
            rings={4}
            grayscale={false}
            spread={5}
            fade={3}
            dispersion={0}
            glint={0}
            tint="#a855f7"
            tintAmount={0}
            highlightColor="#ffffff"
            trigger="hover"
            clickStrength={2}
            quality="high"
            enabled={!reduceMotion}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ProjectCard({ project, index }) {
  const cardRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 0.42, 1], [36, 0, -20]);
  return (
    <motion.article
      ref={cardRef}
      className="project-card"
      style={{ y: reduceMotion ? 0 : y, zIndex: index + 1 }}
    >
      <div className="project-card-image">
        <img src={project.heroImage} alt={`${project.name} 项目封面`} loading={index === 0 ? 'eager' : 'lazy'} />
        <span>{project.id} / {project.tag}</span>
      </div>
      <motion.div className="project-card-copy">
        <div>
          <span>{project.type}</span>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <div className="project-card-roles">{project.roles.map(role => <small key={role}>{role}</small>)}</div>
        </div>
        <div className="project-card-metric">
          <strong>{project.metric}{project.metricUnit && <small className="project-card-metric-unit">{project.metricUnit}</small>}</strong>
          <span>{project.metricLabel}</span>
          <a className="project-cta" href={projectUrl(project.slug)}><span className="project-cta-label"><span>查看项目详情</span><span>查看项目详情</span></span><ArrowRight size={14} /></a>
        </div>
      </motion.div>
      <a className="project-card-hit" href={projectUrl(project.slug)} aria-label={`查看项目详情：${project.name}`} />
    </motion.article>
  );
}

function ProjectPage({ project, onContact }) {
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  return (
    <main className="project-page">
      <header className="nav detail-nav wrap">
        <a className="wordmark" href={BASE_URL}><span className="wordmark-symbol">Z<span>.</span></span><span>YAN ZHAO<br /><small>EXPERIENCE DESIGNER</small></span></a>
        <a className="detail-back" href={BASE_URL}><ArrowDownLeft size={15} /> 返回首页</a>
        <button className="nav-contact" type="button" onClick={onContact}>联系我 <ArrowUpRight size={15} /></button>
      </header>
      <section className="detail-hero wrap">
        <div className="detail-kicker"><span>{project.id} / SELECTED PROJECT</span><span>{project.tag}</span></div>
        <h1>{project.name}</h1>
        <p className="detail-lead">{project.description}</p>
        <div className="detail-facts">{project.facts.map(([label, value]) => <div key={label}><small>{label}</small><span>{value}</span></div>)}</div>
      </section>
      <figure className="detail-cover wrap">
        <img src={project.heroImage} alt={`${project.name} 项目总览`} />
        <figcaption><span>{project.fullName}</span><span>{project.tag}</span></figcaption>
      </figure>
      <section className="detail-story wrap">
        <div className="detail-story-head">
          <SectionLabel number="CASE STUDY">DESIGN PROCESS</SectionLabel>
          <h2>从真实问题出发，<br /><em>让设计产生价值。</em></h2>
        </div>
        <div className="detail-story-copy">
          <article><small>01 / THE CHALLENGE</small><h3>项目挑战</h3><p>{project.challenge}</p></article>
          <article><small>02 / DESIGN APPROACH</small><h3>设计思路</h3><p>{project.approach}</p></article>
          <article><small>03 / OUTCOME</small><h3>项目结果</h3><p>{project.result}</p></article>
        </div>
      </section>
      <section className="detail-gallery">
        <div className="wrap gallery-heading"><span>SELECTED SCREENS</span><h2>设计过程与关键画面</h2><p>从策略思考到界面落地，呈现项目中的代表性设计。</p></div>
        <div className="gallery-list wrap">{project.gallery.map((src, itemIndex) => { const pageNumber = Number(src.split('/').pop().replace('.jpg', '')); return <figure className="gallery-image" key={src}><img src={src} loading={itemIndex > 1 ? 'lazy' : 'eager'} alt={`${project.name} 设计画板 ${pageNumber}`} /><figcaption><span>{project.name}</span><span>{String(pageNumber).padStart(2, '0')} / {String(project.galleryTotal).padStart(2, '0')}</span></figcaption></figure>; })}</div>
      </section>
      <section className="next-project wrap"><div><small>NEXT PROJECT · {next.id}</small><h2>{next.name}</h2></div><a href={projectUrl(next.slug)} aria-label={`查看${next.name}`}><ArrowUpRight size={24} /></a></section>
      <footer className="detail-footer"><a href={BASE_URL}>赵艳 / 短腿书生</a><button type="button" onClick={onContact}>喜欢就联系我 <ArrowUpRight size={15} /></button><span>© 2026 YAN ZHAO</span></footer>
    </main>
  );
}

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const heroRef = useRef(null);
  const portraitRef = useRef(null);
  const contactRef = useRef(null);
  const selectedSlug = new URLSearchParams(window.location.search).get('project');
  const selectedProject = projects.find((project) => project.slug === selectedSlug);

  useEffect(() => {
    document.title = selectedProject ? `${selectedProject.name} / 赵艳作品集` : '赵艳 · 短腿书生 / 资深体验设计师';
  }, [selectedProject]);

  useEffect(() => {
    const revealTargets = document.querySelectorAll([
      '.intro-section > .section-label',
      '.intro-section .portrait-panel',
      '.intro-section .portrait-initials, .intro-section .portrait-caption, .intro-section .portrait-coordinate',
      '.intro-section .intro-copy > *',
      '.intro-section .stats-row > *',
      '.intro-section .career-strip > *',
      '.project-card-image',
      '.capabilities-section > .section-label',
      '.capabilities-section .capabilities-heading > h2',
      '.capabilities-section .capabilities-heading > p',
      '.capabilities-section .capability-grid > article',
      '.capabilities-section .tool-line > *',
      '.contact-stage > *',
      '.contact-bottom > *',
    ].join(','));
    revealTargets.forEach((item) => item.setAttribute('data-reveal', ''));
    document.querySelectorAll('.intro-section .intro-copy > *').forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${140 + index * 100}ms`);
    });
    document.querySelectorAll('.intro-section .portrait-initials, .intro-section .portrait-caption, .intro-section .portrait-coordinate').forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${240 + index * 100}ms`);
    });
    document.querySelectorAll('.intro-section .stats-row > *, .intro-section .career-strip > *').forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * 100}ms`);
    });
    const capabilityIntro = document.querySelectorAll('.capabilities-section > .section-label, .capabilities-section .capabilities-heading > *, .capabilities-section .capability-grid > article');
    capabilityIntro.forEach((item, index) => item.style.setProperty('--reveal-delay', `${index * 110}ms`));
    document.querySelectorAll('.capabilities-section .tool-line > *').forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${760 + index * 110}ms`);
    });
    const items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.14 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [selectedProject]);

  const openContact = () => setContactOpen(true);

  if (selectedProject) return <>{<ProjectPage project={selectedProject} onContact={openContact} />}{contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}</>;

  return (
    <main>
      <section className="hero" id="top" ref={heroRef}>
        <div className="hero-media" aria-hidden="true">
          <div className="hero-image-fallback" style={{ backgroundImage: `url("${asset('assets/portfolio/home-background.jpg')}")` }} />
          <div className="hero-iridescence" />
          <Iridescence className="hero-iridescence-canvas" interactionRef={heroRef} />
          <HeroFluid heroRef={heroRef} />
          <div className="hero-shade" />
        </div>
        <header className="nav wrap">
          <a className="wordmark" href="#top"><span className="wordmark-symbol">Z<span>.</span></span><span>Yan ZHAO<br /><small>EXPERIENCE DESIGNER</small></span></a>
          <nav aria-label="主导航"><a href="#about">关于</a><a href="#work">项目</a><a href="#capabilities">优势</a></nav>
          <button className="nav-contact" type="button" onClick={openContact}>联系我 <ArrowUpRight size={15} /></button>
        </header>
        <div className="hero-content wrap">
          <div className="hero-kicker"><span className="status-dot" /> INDEPENDENT DESIGN PRACTICE <span className="kicker-year">HANGZHOU · 2026</span></div>
          <img className="hero-title-art" src={asset('assets/portfolio/home-title.png')} alt="设计连接感受，也创造增长。" />
          <div className="hero-bottom">
            <div className="hero-intro-copy"><p>你好，我是赵艳，也可以叫我短腿书生。<br />一名资深体验设计师与 AI 设计实践者。</p><a className="resume-download" href={asset('assets/portfolio/yan-zhao-resume.pdf')} download="赵艳-简历.pdf"><img src={asset('assets/portfolio/home-download.svg')} alt="" />下载简历</a></div>
            <div className="hero-aside"><span>SCROLL TO EXPLORE</span><i /></div>
          </div>
        </div>
        <a className="hero-scroll" href="#about" aria-label="向下浏览"><img src={asset('assets/portfolio/home-scroll.svg')} alt="" /></a>
        <div className="hero-index"><span>01 / 05</span><span>DESIGN FOR PEOPLE<br />BUILT FOR IMPACT</span></div>
      </section>

      <section className="intro-section section wrap" id="about">
        <SectionLabel number="01">ABOUT THE DESIGNER</SectionLabel>
        <div className="intro-grid">
          <div className="portrait-panel" ref={portraitRef}>
            <div className="portrait-bg" style={{ backgroundImage: `linear-gradient(160deg,rgba(22,119,255,.12),transparent 52%),url("${asset('assets/portrait.png')}")` }} />
            <div className="portrait-initials">YZ<span>.</span></div>
            <div className="portrait-caption"><span>赵艳 / 短腿书生</span><span>杭州 · 中国</span></div>
            <span className="portrait-coordinate">30°16' N<br />120°09' E</span>
            <TargetCursor targetRef={portraitRef} size={36} spinDuration={2} hoverDuration={0.2} parallaxOn />
          </div>
          <div className="intro-copy">
            <div className="intro-overline">SENIOR EXPERIENCE DESIGNER · AI PRACTITIONER</div>
            <h2>好的设计始于<br />对人的理解。</h2>
            <p>拥有 8 年 UI 与体验设计经验，长期参与消费端产品、商业化体验和 AI 创新设计。我擅长从用户场景和业务目标出发，完成问题梳理、体验策略、信息架构、交互与视觉设计，并与产品、研发共同推动落地。</p>
            <p>我重视用户的情绪与体验细节，也关注设计对业务目标的实际贡献。近年来持续探索 AI 在产品与视觉创作中的应用，关注生成体验、用户信任和结果质量。</p>
            <p>让用户更容易完成目标，也让团队清楚为什么这样设计、如何验证设计是否有效，是我对好设计的理解。</p>
            <div className="contact-row"><span className="contact-email-text"><AtSign size={15} />982808545@qq.com</span><a href="tel:13222081752">T. 132 2208 1752</a><span>WECHAT · haliaseyou</span></div>
          </div>
          <div className="stats-row">
            <div className="stat-card"><img src={asset('assets/portfolio/stat-icon-2024.png')} alt="" /><div><strong>2024</strong><small>年度优质作品</small></div></div>
            <div className="stat-card"><img src={asset('assets/portfolio/stat-icon-cities.png')} alt="" /><div><strong>30+</strong><small>设计输出服务城市</small></div></div>
            <div className="stat-card"><img src={asset('assets/portfolio/stat-icon-partners.png')} alt="" /><div><strong>100+</strong><small>设计落地对接品牌合作商</small></div></div>
          </div>
        </div>
        <div className="career-strip"><span className="career-label">CAREER PATH</span><div><b>2021.08 — 2026.09</b><span>杭州全速网络技术有限公司 / 资深视觉设计师</span><p>负责金融 App 皮肤频道、搜索、B 端搜索与国际支付体验；参与需求分析、交互与视觉设计、上线走查和迭代。搭建搜索组件库与资产入库流程，推进设计工程化及 AIGC 工作流。</p></div><div><b>2019.06 — 2021.08</b><span>南京泰禾网络科技有限公司 / UI 设计师</span><p>负责 App、小程序、公众号、官网、B 端后台及 H5 设计；参与需求拆解、竞品分析、信息架构与原型设计，协同产品及前端推动落地与体验优化。</p></div><div className="career-education"><b>EDUCATION</b><span>南京邮电大学通达学院<br />计算机科学与技术 · 本科</span></div></div>
      </section>

      <section className="work-section section" id="work">
        <div className="wrap">
          <div className="work-heading-row"><SectionLabel number="02">SELECTED WORK · PRODUCT & AI</SectionLabel></div>
        </div>
        <div className="project-list">
          {projects.filter((project) => project.id !== '04').map((project, index) => <ProjectCard project={project} index={index} key={project.id} />)}
        </div>
        <div className="wrap">
          <p className="work-note">* 皮肤中心数据口径：2025 年 12 月，100 万用户范围内；订单转化率提升 2.4% 来自灰度阶段。LT30 指用户在 30 天内的活跃天数，用于衡量用户黏性与留存。</p>
        </div>
      </section>

      <section className="capabilities-section section wrap" id="capabilities">
        <SectionLabel number="03">HOW I CREATE VALUE</SectionLabel>
        <div className="capabilities-heading"><h2>把复杂问题，<br /><em>设计成清晰体验。</em></h2><p>从发现问题到推动落地，<br />我关注每一步如何为用户和业务创造价值。</p></div>
        <div className="capability-grid">{capabilities.map(([num, title, body, tag]) => <article className="capability" key={num}><div className="capability-meta"><span>{num}</span><Asterisk size={17} /></div><h3>{title}</h3><p>{body}</p><span className="capability-tag">{tag}</span></article>)}</div>
        <div className="tool-line"><span>TOOLS & WORKFLOW</span><p>Figma · Sketch · Photoshop · Illustrator · After Effects · Blender · Midjourney · Cursor<br /><span className="tool-note">熟悉 Lovart、Stable Diffusion、即梦等 AIGC 工具，以及常见的设计工程化工作流。</span></p></div>
      </section>

      <footer className="contact-section" id="contact" ref={contactRef}>
        <div className="contact-bg" style={{ backgroundImage: `linear-gradient(90deg,rgba(4,7,25,.74),rgba(4,7,25,.38) 56%,rgba(4,7,25,.2)),linear-gradient(0deg,rgba(4,7,25,.62),transparent 43%),url("${asset('assets/portfolio/home-background.jpg')}")` }} />
        <Iridescence className="contact-iridescence-canvas" interactionRef={contactRef} />
        <div className="wrap contact-inner">
          <SectionLabel number="04">LET'S MAKE SOMETHING MATTER</SectionLabel>
          <div className="contact-stage">
            <div className="contact-main"><span className="contact-eyebrow" data-reveal>OPEN TO THE NEXT CHALLENGE</span><img className="contact-title-art" data-reveal style={{ '--reveal-delay': '180ms' }} src={asset('assets/portfolio/contact-title.png')} alt="让好的体验，抵达更多人。" /><button className="contact-button" data-reveal style={{ '--reveal-delay': '360ms' }} type="button" onClick={openContact}>喜欢就联系我 <ArrowUpRight size={17} /></button></div>
            <aside className="wechat-expand" data-reveal style={{ '--reveal-delay': '260ms' }}>
              <div className="wechat-expand-heading">
                <span className="wechat-expand-icon"><QrCode size={18} /></span>
                <span>我的微信二维码</span>
              </div>
              <div className="wechat-expand-panel" id="footer-wechat-panel">
                <div className="wechat-expand-content">
                  <img src={asset('assets/weixin.png')} alt="赵艳的微信二维码" />
                  <span>微信扫码添加</span>
                </div>
              </div>
            </aside>
          </div>
        <div className="contact-bottom"><span className="contact-email">982808545@qq.com</span><div className="footer-meta"><span>赵艳 / 短腿书生</span><span>HANGZHOU, CHINA</span><span>© 2026 YAN ZHAO</span></div><a className="back-top" href={`${BASE_URL}#top`}>BACK TO TOP ↑</a></div>
        </div>
      </footer>
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </main>
  );
}
