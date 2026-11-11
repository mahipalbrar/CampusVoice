import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUp,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  Flame,
  Home,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

type Category = 'Infrastructure' | 'Academics' | 'Hostel' | 'Cafeteria' | 'Wi-Fi' | 'Safety' | 'Other'
type FeedbackType = 'Complaint' | 'Suggestion' | 'Appreciation'
type Status = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved'
type View = 'dashboard' | 'feed' | 'submit' | 'mine' | 'admin'

type Feedback = {
  id: string
  title: string
  description: string
  category: Category
  type: FeedbackType
  status: Status
  createdAt: string
  votes: number
  votedByDemo: boolean
  isMine: boolean
}

const categories: Category[] = ['Infrastructure', 'Academics', 'Hostel', 'Cafeteria', 'Wi-Fi', 'Safety', 'Other']
const statuses: Status[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved']
const categoryColors: Record<Category, string> = {
  Infrastructure: '#6c63ff',
  Academics: '#ff9f43',
  Hostel: '#ff6b81',
  Cafeteria: '#20bf6b',
  'Wi-Fi': '#2d98da',
  Safety: '#a55eea',
  Other: '#778ca3',
}

const initialFeedback: Feedback[] = [
  { id: 'seed-1', title: 'Poor Wi-Fi connectivity in academic blocks', description: 'The connection drops frequently during lectures, especially on the second and third floors. It makes accessing course material really difficult.', category: 'Wi-Fi', type: 'Complaint', status: 'In Progress', createdAt: '2026-11-09T10:20:00', votes: 84, votedByDemo: false, isMine: false },
  { id: 'seed-2', title: 'Classroom projector not working', description: 'Projector in Room B-204 has been flickering for over a week. It would be great to have this checked before the next round of presentations.', category: 'Academics', type: 'Complaint', status: 'Under Review', createdAt: '2026-11-08T14:10:00', votes: 62, votedByDemo: true, isMine: false },
  { id: 'seed-3', title: 'Hostel water supply issue', description: 'There has been no hot water in Block C between 7–9 AM for the last three days. A lot of students are affected before morning classes.', category: 'Hostel', type: 'Complaint', status: 'Submitted', createdAt: '2026-11-07T08:45:00', votes: 51, votedByDemo: false, isMine: false },
  { id: 'seed-4', title: 'Library reading room lighting', description: 'Several lights in the east reading room are out. The room becomes quite difficult to use after sunset.', category: 'Infrastructure', type: 'Complaint', status: 'Resolved', createdAt: '2026-11-06T16:30:00', votes: 47, votedByDemo: false, isMine: false },
  { id: 'seed-5', title: 'Broken classroom furniture', description: 'A few desks in the humanities building have loose legs and sharp edges. Please replace or repair them for student safety.', category: 'Infrastructure', type: 'Complaint', status: 'In Progress', createdAt: '2026-11-05T11:15:00', votes: 38, votedByDemo: false, isMine: false },
  { id: 'seed-6', title: 'More charging points needed', description: 'Adding charging points near the library and student commons would make long study sessions much more comfortable.', category: 'Infrastructure', type: 'Suggestion', status: 'Submitted', createdAt: '2026-11-04T13:05:00', votes: 34, votedByDemo: false, isMine: false },
  { id: 'seed-7', title: 'Cafeteria cleanliness', description: 'The tables near the windows are often left uncleared during lunch. More frequent cleaning would make the space much nicer.', category: 'Cafeteria', type: 'Complaint', status: 'Under Review', createdAt: '2026-11-03T12:40:00', votes: 29, votedByDemo: false, isMine: false },
  { id: 'seed-8', title: 'Better sports equipment', description: 'The badminton rackets and basketballs have seen better days. A small refresh of the equipment would benefit the whole campus.', category: 'Other', type: 'Suggestion', status: 'Submitted', createdAt: '2026-11-02T09:10:00', votes: 23, votedByDemo: false, isMine: false },
  { id: 'seed-9', title: 'Washroom maintenance', description: 'The second floor washroom in the science building needs attention to its taps and soap dispensers.', category: 'Safety', type: 'Complaint', status: 'Resolved', createdAt: '2026-10-31T15:25:00', votes: 19, votedByDemo: false, isMine: false },
  { id: 'seed-10', title: 'Improved campus accessibility', description: 'A ramp at the old auditorium entrance and clearer accessibility signs would make events easier to access for everyone.', category: 'Safety', type: 'Suggestion', status: 'In Progress', createdAt: '2026-10-30T10:00:00', votes: 56, votedByDemo: false, isMine: false },
  { id: 'mine-1', title: 'Add more quiet study zones', description: 'A few dedicated quiet zones in the student center would help us find focused space during exam season.', category: 'Academics', type: 'Suggestion', status: 'Under Review', createdAt: '2026-11-01T10:00:00', votes: 17, votedByDemo: false, isMine: true },
]

const navItems: { id: View; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'feed', label: 'Community feed', icon: MessageSquareText },
  { id: 'submit', label: 'Submit feedback', icon: Plus },
  { id: 'mine', label: 'My feedback', icon: ClipboardList },
]

const formatDate = (date: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date))
const relativeDate = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`
}

function App() {
  const [feedback, setFeedback] = useState<Feedback[]>(() => {
    const stored = localStorage.getItem('campusvoice-feedback')
    return stored ? JSON.parse(stored) as Feedback[] : initialFeedback
  })
  const [view, setView] = useState<View>('dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem('campusvoice-feedback', JSON.stringify(feedback))
  }, [feedback])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const changeView = (nextView: View) => {
    setView(nextView)
    setMobileNav(false)
  }

  const toggleVote = (id: string) => {
    setFeedback((current) => current.map((item) => item.id === id ? { ...item, votes: item.votes + (item.votedByDemo ? -1 : 1), votedByDemo: !item.votedByDemo } : item))
    setToast(feedback.find((item) => item.id === id)?.votedByDemo ? 'Vote removed' : 'Thanks for making your voice count!')
  }

  const addFeedback = (item: Omit<Feedback, 'id' | 'createdAt' | 'votes' | 'votedByDemo' | 'isMine'>) => {
    setFeedback((current) => [{ ...item, id: `mine-${Date.now()}`, createdAt: new Date().toISOString(), votes: 0, votedByDemo: false, isMine: true }, ...current])
    setToast('Feedback submitted — thanks for speaking up!')
    changeView('mine')
  }

  const deleteFeedback = (id: string) => {
    setFeedback((current) => current.filter((item) => item.id !== id))
    setToast('Feedback deleted')
  }

  const updateStatus = (id: string, status: Status) => {
    setFeedback((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    setToast(`Status updated to ${status}`)
  }

  const resolved = feedback.filter((item) => item.status === 'Resolved').length
  const awaiting = feedback.filter((item) => item.status !== 'Resolved').length
  const totalVotes = feedback.reduce((sum, item) => sum + item.votes, 0)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><span /></div>
          <div><strong>campus<span>voice</span></strong><small>Student feedback, amplified</small></div>
          <button className="icon-btn close-nav" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => changeView(id)}>
              <Icon size={18} strokeWidth={view === id ? 2.4 : 1.8} /><span>{label}</span>{id === 'submit' && <kbd>⌘ K</kbd>}
            </button>
          ))}
          <div className="nav-divider" />
          <button className={`nav-item ${view === 'admin' ? 'active' : ''}`} onClick={() => changeView('admin')}><ShieldCheck size={18} /><span>Admin dashboard</span><span className="admin-pill">DEMO</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="impact-card"><div className="impact-icon"><Sparkles size={16} /></div><div><strong>Make an impact</strong><p>Every voice moves us forward.</p></div><ChevronDown size={16} /></div>
          <div className="user-profile"><div className="avatar">JD</div><div><strong>Jordan Davis</strong><small>Student · Anonymous mode</small></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>
      {mobileNav && <button className="mobile-backdrop" onClick={() => setMobileNav(false)} aria-label="Close menu" />}
      <main className="main-content">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={22} /></button>
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{navItems.find((item) => item.id === view)?.label ?? 'Admin dashboard'}</strong></div>
          <div className="topbar-actions"><button className="icon-btn" aria-label="Help"><CircleHelp size={20} /></button><button className="icon-btn notification" aria-label="Notifications"><Bell size={20} /><i /></button><div className="top-avatar">JD</div></div>
        </header>
        {view === 'dashboard' && <Dashboard feedback={feedback} totalVotes={totalVotes} resolved={resolved} awaiting={awaiting} onNavigate={changeView} />}
        {view === 'feed' && <Feed feedback={feedback} onVote={toggleVote} />}
        {view === 'submit' && <SubmitForm onSubmit={addFeedback} />}
        {view === 'mine' && <MyFeedback feedback={feedback.filter((item) => item.isMine)} onVote={toggleVote} onDelete={deleteFeedback} onSubmit={() => changeView('submit')} />}
        {view === 'admin' && <Admin feedback={feedback} onStatus={updateStatus} />}
      </main>
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: React.ReactNode; description: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function Dashboard({ feedback, totalVotes, resolved, awaiting, onNavigate }: { feedback: Feedback[]; totalVotes: number; resolved: number; awaiting: number; onNavigate: (view: View) => void }) {
  const categoryCounts = categories.map((category) => ({ category, count: feedback.filter((item) => item.category === category).length }))
  const maxCount = Math.max(...categoryCounts.map((item) => item.count))
  const resolutionRate = Math.round((resolved / feedback.length) * 100)
  return <div className="content-wrap">
    <PageHeader eyebrow="Tuesday, November 11, 2026" title={<>Good morning, Jordan <span className="wave">✦</span></>} description="Here’s what’s happening across your campus today." action={<button className="primary-btn" onClick={() => onNavigate('submit')}><Plus size={17} /> Submit feedback</button>} />
    <section className="hero-banner"><div className="hero-glow" /><div className="hero-copy"><div className="hero-label"><Zap size={14} fill="currentColor" /> YOUR VOICE MATTERS</div><h2>Small feedback.<br /><em>Big change.</em></h2><p>Help shape a better campus, one thoughtful idea at a time.</p><button className="hero-button" onClick={() => onNavigate('feed')}>Explore community feedback <ArrowUp size={15} /></button></div><div className="hero-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-card art-card-main"><MessageSquareText size={22} /><strong>1,284</strong><span>voices heard</span></div><div className="art-card art-card-small"><TrendingUp size={16} /><strong>+18.4%</strong><span>this month</span></div><div className="art-dot dot-one" /><div className="art-dot dot-two" /></div></section>
    <div className="stat-grid">
      <StatCard icon={<MessageSquareText />} label="Total submissions" value={feedback.length.toString()} meta="+12.5% vs last month" trend="up" color="purple" />
      <StatCard icon={<ArrowUp />} label="Community votes" value={totalVotes.toLocaleString()} meta="+8.2% vs last month" trend="up" color="blue" />
      <StatCard icon={<CheckCircle2 />} label="Issues resolved" value={resolved.toString()} meta={`${resolutionRate}% resolution rate`} trend="up" color="green" />
      <StatCard icon={<Clock3 />} label="Awaiting action" value={awaiting.toString()} meta="Across all categories" color="orange" />
    </div>
    <div className="dashboard-grid">
      <section className="panel recent-panel"><PanelHeading title="Recent submissions" subtitle="The latest voices from your campus" action={<button className="text-btn" onClick={() => onNavigate('feed')}>View all <ArrowUp size={14} /></button>} /><div className="recent-list">{feedback.slice(0, 5).map((item) => <FeedbackRow key={item.id} item={item} />)}</div></section>
      <section className="panel category-panel"><PanelHeading title="Feedback by category" subtitle="Where your campus needs attention" /><div className="category-chart">{categoryCounts.filter((item) => item.count > 0).map(({ category, count }) => <div className="bar-row" key={category}><div className="bar-label"><span><i style={{ background: categoryColors[category] }} />{category}</span><strong>{count}</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${(count / maxCount) * 100}%`, background: categoryColors[category] }} /></div></div>)}</div><div className="chart-foot"><span><i className="legend-dot" /> Total feedback</span><strong>{feedback.length} submissions</strong></div></section>
    </div>
    <section className="panel resolution-panel"><PanelHeading title="Resolution overview" subtitle="Tracking campus improvements, together" action={<span className="period-select">Last 30 days <ChevronDown size={15} /></span>} /><div className="resolution-content"><div className="donut-wrap"><div className="donut" style={{ background: `conic-gradient(#6c63ff ${resolutionRate}%, #e9e9f4 0)` }}><div><strong>{resolutionRate}%</strong><span>resolved</span></div></div></div><div className="resolution-stats">{statuses.map((status) => <div key={status} className="resolution-stat"><span className={`status-dot ${status.toLowerCase().replace(' ', '-')}`} /><div><strong>{feedback.filter((item) => item.status === status).length}</strong><span>{status}</span></div></div>)}</div><div className="resolution-note"><div className="note-icon"><Flame size={18} /></div><div><strong>Keep the momentum going</strong><p>Campus response is up <b>14%</b> this month.</p></div></div></div></section>
  </div>
}

function StatCard({ icon, label, value, meta, trend, color }: { icon: React.ReactNode; label: string; value: string; meta: string; trend?: 'up'; color: string }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-label">{label}</div><strong className="stat-value">{value}</strong><div className={`stat-meta ${trend ? 'positive' : ''}`}>{trend && <TrendingUp size={13} />}{meta}</div></div>
}

function PanelHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="panel-heading"><div><h3>{title}</h3><p>{subtitle}</p></div>{action}</div>
}

function FeedbackRow({ item }: { item: Feedback }) {
  return <div className="feedback-row"><div className="row-category" style={{ background: `${categoryColors[item.category]}16`, color: categoryColors[item.category] }}>{item.category === 'Wi-Fi' ? <Wifi size={16} /> : item.category === 'Academics' ? <BookOpen size={16} /> : <Home size={16} />}</div><div className="row-info"><strong>{item.title}</strong><span>{item.category} <i /> {relativeDate(item.createdAt)}</span></div><StatusBadge status={item.status} /><div className="row-votes"><ArrowUp size={14} />{item.votes}</div></div>
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}><i />{status}</span>
}

function Feed({ feedback, onVote }: { feedback: Feedback[]; onVote: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All statuses')
  const [sort, setSort] = useState('Newest')
  const filtered = useMemo(() => feedback.filter((item) => (category === 'All categories' || item.category === category) && (status === 'All statuses' || item.status === status) && `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'Most voted' ? b.votes - a.votes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [feedback, category, status, search, sort])
  return <div className="content-wrap"><PageHeader eyebrow="COMMUNITY FEED" title="What’s on campus’ mind?" description="Browse, support and follow the conversations shaping our community." action={<div className="feed-count"><strong>{filtered.length}</strong><span>voices shared</span></div>} /><div className="filter-bar"><div className="search-field"><Search size={17} /><input placeholder="Search feedback..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><select value={category} onChange={(e) => setCategory(e.target.value)}><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select value={sort} onChange={(e) => setSort(e.target.value)}><option>Newest</option><option>Most voted</option></select></div><div className="feed-list">{filtered.map((item) => <FeedbackCard key={item.id} item={item} onVote={onVote} />)}</div>{filtered.length === 0 && <EmptyState icon={<Search />} title="No feedback found" text="Try changing your search or filters." />}</div>
}

function FeedbackCard({ item, onVote }: { item: Feedback; onVote: (id: string) => void }) {
  return <article className="feedback-card"><div className="card-top"><span className="category-tag" style={{ color: categoryColors[item.category], background: `${categoryColors[item.category]}14` }}><i style={{ background: categoryColors[item.category] }} />{item.category}</span><span className="card-date">{formatDate(item.createdAt)}</span><button className="more-btn" aria-label="More options"><MoreHorizontal size={19} /></button></div><h3>{item.title}</h3><p>{item.description}</p><div className="card-footer"><div className="card-meta"><StatusBadge status={item.status} /><span className="type-label">{item.type}</span><span className="anonymous"><ShieldCheck size={13} /> Anonymous</span></div><button className={`vote-btn ${item.votedByDemo ? 'voted' : ''}`} onClick={() => onVote(item.id)}><ArrowUp size={16} /><strong>{item.votes}</strong><span>{item.votedByDemo ? 'Voted' : 'Support'}</span></button></div></article>
}

function SubmitForm({ onSubmit }: { onSubmit: (item: Omit<Feedback, 'id' | 'createdAt' | 'votes' | 'votedByDemo' | 'isMine'>) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('Infrastructure')
  const [type, setType] = useState<FeedbackType>('Complaint')
  const [error, setError] = useState('')
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!title.trim() || !description.trim()) { setError('Please add a title and description before submitting.'); return } onSubmit({ title: title.trim(), description: description.trim(), category, type, status: 'Submitted' }) }
  return <div className="content-wrap narrow"><PageHeader eyebrow="SHARE YOUR VOICE" title="Start a conversation" description="Your experience can help make campus better for everyone." /><form className="submit-layout" onSubmit={submit}><div className="panel form-panel"><div className="form-intro"><div className="form-icon"><Lightbulb size={21} /></div><div><h3>What would you like to share?</h3><p>Be specific and constructive. The more context you give, the easier it is to take action.</p></div></div><label>Title <span>Required</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your feedback a clear title" /></label><label>Description <span>Required</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us more about what happened or what you'd like to see..." rows={6} /><small>{description.length}/500 characters</small></label><div className="two-fields"><label>Category<select value={category} onChange={(e) => setCategory(e.target.value as Category)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Type<select value={type} onChange={(e) => setType(e.target.value as FeedbackType)}><option>Complaint</option><option>Suggestion</option><option>Appreciation</option></select></label></div>{error && <div className="form-error">{error}</div>}<div className="form-actions"><button type="button" className="secondary-btn">Save draft</button><button className="primary-btn" type="submit"><SendIcon /> Submit feedback</button></div></div><aside className="submit-aside"><div className="privacy-card"><div className="privacy-icon"><ShieldCheck size={20} /></div><h3>Anonymous by default</h3><p>Your name won’t be displayed alongside this feedback. In this frontend demo, anonymous mode hides your displayed identity; it is not a guarantee of server-side anonymity.</p><div className="toggle-line"><span>Submit anonymously</span><div className="toggle on"><i /></div></div></div><div className="tip-card"><Sparkles size={17} /><div><strong>Helpful tip</strong><p>Feedback with a clear example gets 2× more support from the community.</p></div></div></aside></form></div>
}

function SendIcon() { return <ArrowUp size={16} /> }

function MyFeedback({ feedback, onVote, onDelete, onSubmit }: { feedback: Feedback[]; onVote: (id: string) => void; onDelete: (id: string) => void; onSubmit: () => void }) {
  return <div className="content-wrap"><PageHeader eyebrow="YOUR ACTIVITY" title="My feedback" description="Keep track of the ideas and issues you’ve shared with the community." action={<button className="primary-btn" onClick={onSubmit}><Plus size={17} /> New feedback</button>} /><div className="mine-summary"><div><span>Total shared</span><strong>{feedback.length}</strong></div><div><span>Community support</span><strong>{feedback.reduce((sum, item) => sum + item.votes, 0)} <ArrowUp size={16} /></strong></div><div><span>Resolved</span><strong>{feedback.filter((item) => item.status === 'Resolved').length}</strong></div></div><div className="mine-list">{feedback.map((item) => <article className="mine-card" key={item.id}><div className="mine-card-top"><div><span className="category-tag" style={{ color: categoryColors[item.category], background: `${categoryColors[item.category]}14` }}><i style={{ background: categoryColors[item.category] }} />{item.category}</span><span className="card-date">{formatDate(item.createdAt)}</span></div><button className="delete-btn" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={17} /></button></div><h3>{item.title}</h3><p>{item.description}</p><div className="mine-bottom"><StatusBadge status={item.status} /><span className="mine-votes"><ArrowUp size={15} /> {item.votes} votes</span><button className={`small-vote ${item.votedByDemo ? 'voted' : ''}`} onClick={() => onVote(item.id)}>{item.votedByDemo ? 'Remove support' : 'Support your feedback'}</button></div></article>)}</div>{feedback.length === 0 && <EmptyState icon={<ClipboardList />} title="You haven’t shared anything yet" text="Your first piece of feedback could be the start of meaningful change." action={<button className="primary-btn" onClick={onSubmit}><Plus size={16} /> Submit feedback</button>} />}</div>
}

function Admin({ feedback, onStatus }: { feedback: Feedback[]; onStatus: (id: string, status: Status) => void }) {
  const [filter, setFilter] = useState('All statuses')
  const visible = feedback.filter((item) => filter === 'All statuses' || item.status === filter)
  return <div className="content-wrap"><PageHeader eyebrow="OPERATIONS · DEMO MODE" title="Admin dashboard" description="Monitor, prioritize and move campus feedback forward." action={<span className="demo-badge"><ShieldCheck size={14} /> Local demo</span>} /><div className="admin-stats"><StatCard icon={<MessageSquareText />} label="All submissions" value={feedback.length.toString()} meta="Across campus" color="purple" /><StatCard icon={<Clock3 />} label="Needs review" value={feedback.filter((item) => item.status === 'Submitted').length.toString()} meta="Ready for triage" color="orange" /><StatCard icon={<Zap />} label="In progress" value={feedback.filter((item) => item.status === 'In Progress').length.toString()} meta="Being worked on" color="blue" /><StatCard icon={<CheckCircle2 />} label="Resolved" value={feedback.filter((item) => item.status === 'Resolved').length.toString()} meta="Closed successfully" color="green" /></div><section className="panel admin-panel"><div className="admin-toolbar"><PanelHeading title="All feedback" subtitle={`${visible.length} submissions in this view`} /><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div><div className="admin-table"><div className="table-head"><span>Feedback</span><span>Category</span><span>Submitted</span><span>Status</span><span>Votes</span></div>{visible.map((item) => <div className="table-row" key={item.id}><div className="table-feedback"><div className="table-icon" style={{ color: categoryColors[item.category] }}><MessageSquareText size={16} /></div><div><strong>{item.title}</strong><span>{item.isMine ? 'Jordan Davis' : 'Anonymous student'}</span></div></div><span className="table-category">{item.category}</span><span className="table-date">{formatDate(item.createdAt)}</span><select className={`status-select ${item.status.toLowerCase().replace(' ', '-')}`} value={item.status} onChange={(e) => onStatus(item.id, e.target.value as Status)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><span className="table-votes"><ArrowUp size={14} />{item.votes}</span></div>)}</div></section></div>
}

function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{text}</p>{action}</div>
}

export default App
