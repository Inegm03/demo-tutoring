import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe, ChevronDown, MessagesSquare, BadgeCheck, ShieldCheck, Star,
  Wallet, Sparkles, ArrowRight, ArrowLeft, EyeOff, Flag, Database,
} from 'lucide-react';
import { Logo, Button, SubjectIcon, DemoTag, FunIconChip } from '../components/ui';
import { useLang } from '../i18n/LanguageContext';
import { SUBJECTS } from '../lib/subjects';
import { BRAND } from '../config/brand';

export default function Landing() {
  const { t, lang, setLang, dir } = useLang();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const steps = [
    { icon: MessagesSquare, title: t('landing.how.1.title'), body: t('landing.how.1.body') },
    { icon: Wallet, title: t('landing.how.2.title'), body: t('landing.how.2.body') },
    { icon: BadgeCheck, title: t('landing.how.3.title'), body: t('landing.how.3.body') },
    { icon: Sparkles, title: t('landing.how.4.title'), body: t('landing.how.4.body') },
  ];

  const safety = [
    { icon: EyeOff, title: t('landing.safety.1.title'), body: t('landing.safety.1.body') },
    { icon: Flag, title: t('landing.safety.2.title'), body: t('landing.safety.2.body') },
    { icon: Database, title: t('landing.safety.3.title'), body: t('landing.safety.3.body') },
  ];

  return (
    <div className="min-h-dvh bg-[#f6f8f7]">
      {/* header */}
      <header className="sticky top-0 z-40 bg-[#f6f8f7]/85 backdrop-blur border-b border-ink-100/60">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-100/70 transition-colors"
            >
              <Globe className="h-4 w-4" aria-hidden />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <Link to="/auth/signin" className="hidden sm:block">
              <Button variant="outline" size="sm" className="!px-4 !py-2">{t('auth.signIn.button')}</Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="!px-4 !py-2">{t('auth.createAccount')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 -end-32 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="absolute top-40 -start-40 h-80 w-80 rounded-full bg-sand-100/70 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="inline-flex items-center gap-2 rounded-full bg-white border border-ink-100 px-3 py-1 text-xs font-semibold text-ink-600 shadow-soft mb-5">
              <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden />
              {t('landing.hero.demoNote')}
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink-950 leading-[1.1] mb-5">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg text-ink-600 leading-relaxed mb-8 max-w-lg">{t('landing.hero.sub')}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth/signin?demo=student">
                <Button size="lg" full className="sm:w-auto">
                  {t('landing.hero.ctaStudent')}
                  <Arrow className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <Link to="/auth/signin?demo=teacher">
                <Button size="lg" variant="outline" full className="sm:w-auto">{t('landing.hero.ctaTeacher')}</Button>
              </Link>
            </div>
          </motion.div>

          {/* hero visual: stylized request card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="relative hidden md:block"
            aria-hidden
          >
            <div className="card p-6 max-w-sm mx-auto rotate-1">
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 font-bold text-ink-900">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><SubjectIcon icon="sigma" /></span>
                  {lang === 'ar' ? 'الرياضيات' : 'Mathematics'}
                </span>
                <span className="rounded-full bg-sand-50 border border-sand-200 px-2.5 py-0.5 text-xs font-bold text-sand-700">60 {t('common.min')}</span>
              </div>
              <p className="text-sm text-ink-600 mb-1 font-medium">{lang === 'ar' ? 'المعادلات التربيعية' : 'Quadratic equations'}</p>
              <p className="text-xs text-ink-400 mb-4">{lang === 'ar' ? 'ثانوي · الصف الأول' : 'Secondary · Grade 1'}</p>
              <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                <span className="text-2xl font-extrabold text-ink-900">{lang === 'ar' ? '35 ر.س' : '35 SAR'}</span>
                <span className="rounded-xl bg-brand-600 text-white text-sm font-bold px-4 py-2">{t('req.submit')}</span>
              </div>
            </div>
            <div className="card p-4 max-w-[240px] -mt-6 ms-auto -rotate-2 relative z-10">
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white font-bold">
                  أ
                  <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full bg-brand-400 border-2 border-white" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">{lang === 'ar' ? 'قبل أحمد طلبك' : 'Ahmed accepted'}</p>
                  <p className="text-xs text-ink-500 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-sand-400 text-sand-400" /> 4.9 · 132 {t('common.sessions')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHead title={t('landing.how.title')} sub={t('landing.how.sub')} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.07 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  whileHover={{ scale: 1.12, rotate: [0, -8, 8, -4, 0] }}
                  transition={{ duration: 0.45 }}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700"
                >
                  <s.icon className="h-[22px] w-[22px]" aria-hidden />
                </motion.span>
                <span className="text-xs font-extrabold text-ink-300">0{i + 1}</span>
              </div>
              <h3 className="font-bold text-ink-900 mb-1.5">{s.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* subjects */}
      <section className="bg-white border-y border-ink-100/70">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <SectionHead title={t('landing.subjects.title')} sub={t('landing.subjects.sub')} />
          <ul className="flex flex-wrap gap-3 justify-center">
            {SUBJECTS.map((s) => (
              <motion.li
                key={s.id}
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                className="flex items-center gap-2.5 rounded-2xl border border-ink-100 bg-[#f9fbfa] px-4 py-3 text-sm font-semibold text-ink-800 cursor-default shadow-none hover:shadow-soft"
              >
                <FunIconChip icon={s.icon} size="h-9 w-9" />
                {lang === 'ar' ? s.nameAr : s.nameEn}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* students / teachers */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20 grid md:grid-cols-2 gap-6">
        <AudienceCard
          title={t('landing.students.title')}
          points={[t('landing.students.1'), t('landing.students.2'), t('landing.students.3'), t('landing.students.4')]}
          cta={t('auth.demo.student')}
          to="/auth/signin?demo=student"
          tone="brand"
        />
        <AudienceCard
          title={t('landing.teachers.title')}
          points={[t('landing.teachers.1'), t('landing.teachers.2'), t('landing.teachers.3'), t('landing.teachers.4')]}
          cta={t('auth.demo.teacher')}
          to="/auth/signin?demo=teacher"
          tone="sand"
        />
      </section>

      {/* safety */}
      <section className="bg-ink-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <p className="flex items-center gap-2 text-brand-300 font-bold text-sm mb-3">
              <ShieldCheck className="h-5 w-5" aria-hidden /> {t('landing.safety.title')}
            </p>
            <p className="text-2xl md:text-3xl font-extrabold leading-snug">{t('landing.safety.sub')}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {safety.map((s) => (
              <div key={s.title} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <s.icon className="h-6 w-6 text-brand-300 mb-3" aria-hidden />
                <h3 className="font-bold mb-1.5">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <SectionHead title={t('landing.faq.title')} />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <FaqItem
              key={n}
              q={t(`landing.faq.${n}.q` as Parameters<typeof t>[0])}
              a={t(`landing.faq.${n}.a` as Parameters<typeof t>[0])}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 text-white px-6 py-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" aria-hidden style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <h2 className="relative text-3xl md:text-4xl font-extrabold mb-3">{t('landing.cta.title')}</h2>
          <p className="relative text-white/75 mb-8 max-w-md mx-auto">{t('landing.cta.sub')}</p>
          <Link to="/auth/signin" className="relative inline-block">
            <Button size="lg" className="!bg-white !text-brand-800 hover:!bg-brand-50">
              {t('landing.cta.button')}
              <Arrow className="h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-white border-t border-ink-100">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="max-w-sm">
              <Logo />
              <p className="text-sm text-ink-500 mt-4 leading-relaxed">{t('landing.footer.note')}</p>
              <p className="text-xs text-ink-400 mt-3">{t('footer.independent')}</p>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-sm font-bold text-ink-900 mb-3">{t('landing.footer.legal')}</p>
                <ul className="space-y-2 text-sm text-ink-500">
                  <li><Link className="hover:text-brand-700" to="/legal/privacy">{t('landing.footer.privacy')}</Link></li>
                  <li><Link className="hover:text-brand-700" to="/legal/terms">{t('landing.footer.terms')}</Link></li>
                  <li><Link className="hover:text-brand-700" to="/legal/cookies">{t('landing.footer.cookies')}</Link></li>
                  <li><Link className="hover:text-brand-700" to="/legal/refunds">{t('landing.footer.refunds')}</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-ink-900 mb-3">{t('landing.footer.company')}</p>
                <ul className="space-y-2 text-sm text-ink-500">
                  <li><Link className="hover:text-brand-700" to="/legal/contact">{t('landing.footer.contact')}</Link></li>
                  <li className="text-ink-400">{BRAND.legalBusinessName}</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-ink-100 flex items-center justify-between text-xs text-ink-400">
            <span>© {new Date().getFullYear()} {BRAND.legalBusinessName}</span>
            <DemoTag>{t('common.demo')}</DemoTag>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <h2 className="text-2xl md:text-3xl font-extrabold text-ink-950 mb-3">{title}</h2>
      {sub && <p className="text-ink-500 leading-relaxed">{sub}</p>}
    </div>
  );
}

function AudienceCard({ title, points, cta, to, tone }: { title: string; points: string[]; cta: string; to: string; tone: 'brand' | 'sand' }) {
  return (
    <div className="card p-8">
      <h3 className={`text-xl font-extrabold mb-5 ${tone === 'brand' ? 'text-brand-800' : 'text-sand-800'}`}>{title}</h3>
      <ul className="space-y-3 mb-7">
        {points.map((p) => (
          <li key={p} className="flex gap-3 text-[15px] text-ink-700">
            <BadgeCheck className={`h-5 w-5 shrink-0 mt-0.5 ${tone === 'brand' ? 'text-brand-500' : 'text-sand-500'}`} aria-hidden />
            {p}
          </li>
        ))}
      </ul>
      <Link to={to}>
        <Button variant={tone === 'brand' ? 'primary' : 'outline'}>{cta}</Button>
      </Link>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start font-semibold text-ink-900 hover:bg-ink-50/50 transition-colors"
      >
        {q}
        <ChevronDown className={`h-5 w-5 text-ink-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <p className="px-5 pb-5 text-[15px] text-ink-600 leading-relaxed">{a}</p>}
    </div>
  );
}
