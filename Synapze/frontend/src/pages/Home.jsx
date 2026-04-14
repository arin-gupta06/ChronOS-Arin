import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Award,
  Users,
  Briefcase,
  Star,
  Zap,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const stats = [
    { label: 'Active Students', value: '500+', icon: Users },
    { label: 'Teachers', value: '50+', icon: Award },
    { label: 'Tasks Completed', value: '1.2k+', icon: CheckCircle },
    { label: 'Credits Earned', value: '25k+', icon: Zap },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-brand-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#b6a0ff]/5 via-transparent to-transparent opacity-80"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-[120px] rounded-full"></div>
        
        <div className="wrapper relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter">
              <span className="block text-white">Growth is Built</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#3b82f6]">
                Together
              </span>
            </h1>
            
            <div className="text-xl text-gray-300 max-w-lg leading-relaxed space-y-2">
              <p>Connect. Learn. Contribute.</p>
              <p>Rise with a community that believes in you.</p>
            </div>

            <div className="flex flex-wrap gap-6 items-center pt-4">
              <Link to="/register" className="btn-primary rounded-full px-8 py-3 text-sm font-medium tracking-wide shadow-[0_0_20px_rgba(79,70,229,0.5)] bg-gradient-to-r from-[#2e0964] to-[#3b82f6] hover:from-[#1b0040] hover:to-[#2563eb] border border-[#8f77d6]/20 text-white transition-all duration-300">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 inline" />
              </Link>
              <Link to="/browse" className="text-gray-300 hover:text-white font-medium text-sm border-b border-gray-600 hover:border-gray-400 pb-0.5 transition-all">
                Explore Network
              </Link>
            </div>

            <div className="mt-12 relative">
              <p className="text-[#c084fc] transform -rotate-3 text-xl mt-4 ml-4" style={{ fontFamily: "'Caveat', 'Segoe Script', cursive" }}>
                One step.<br/>
                Stronger together.
              </p>
            </div>
          </div>

          <div className="relative hidden lg:block animate-float pt-24 pb-12">
            <div className="relative z-10 flex flex-col items-end gap-4 max-w-lg ml-auto">
              
              {/* Step 4 */}
              <div className="w-64 bg-[transparent] p-6 rounded-t-2xl rounded-bl-2xl rounded-br-md border-t border-l border-r border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.2)] transform translate-x-4 z-40 backdrop-blur-sm">
                 <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold text-white uppercase tracking-widest text-[14px]">Impact</h3>
                   <Award className="text-[#c084fc]" size={20} />
                 </div>
              </div>

              {/* Step 3 */}
              <div className="w-72 bg-[transparent] p-6 rounded-t-2xl rounded-bl-2xl rounded-br-md border-t border-l border-white/15 shadow-lg transform -translate-x-8 z-30 transition-transform hover:-translate-y-2">
                 <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold text-gray-200 uppercase tracking-widest text-[14px]">Collaboration</h3>
                   <Users className="text-[#a78bfa]" size={20} />
                 </div>
              </div>
              
              {/* Step 2 */}
              <div className="w-80 bg-[transparent] p-6 rounded-t-2xl rounded-bl-2xl rounded-br-md border-t border-l border-white/10 shadow-lg transform -translate-x-20 z-20 transition-transform hover:-translate-y-2">
                 <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest text-[14px]">Mentorship</h3>
                   <TrendingUp className="text-[#818cf8]" size={20} />
                 </div>
              </div>

              {/* Step 1 */}
              <div className="w-96 bg-[transparent] p-6 rounded-t-2xl rounded-bl-2xl rounded-br-md border-t border-l border-white/5 shadow-lg transform -translate-x-32 z-10 transition-transform hover:-translate-y-2">
                 <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest text-[14px]">Opportunities</h3>
                   <Briefcase className="text-[#6366f1]" size={20} />
                 </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-brand-surface/50 relative z-10">
        <div className="wrapper">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#291754]/50 text-brand-accent mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon size={24} />
                </div>
                <h4 className="text-3xl font-display font-bold text-white mb-1">{stat.value}</h4>
                <p className="text-sm font-medium text-gray-400 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Types Redesigned */}
      <section className="py-24 bg-brand-dark relative overflow-hidden">
        <div className="wrapper relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Discover Opportunities</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Whether you're looking to earn academic credits, build your portfolio, or showcase your unique skills to the world, Synapze provides the platform you need to succeed.
              </p>
            </div>
            <Link to="/browse" className="btn-secondary rounded-full px-6 py-2.5 whitespace-nowrap self-start md:self-auto">
              View All Tasks
            </Link>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Card 1 - Enlarged */}
            <div className="md:col-span-8 group bg-[#291754]/40 border border-white/10 hover:border-brand-accent/50 rounded-3xl p-8 md:p-10 transition-all duration-300">
               <div className="flex flex-col md:flex-row gap-8 h-full">
                 <div className="flex-1 space-y-6">
                   <div className="w-14 h-14 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                     <Briefcase size={28} />
                   </div>
                   <div>
                     <h3 className="text-3xl font-bold text-white mb-3">Teacher Tasks</h3>
                     <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-medium mb-4">Earn Academic Credits</span>
                     <p className="text-gray-400 leading-relaxed">
                       Collaborate directly with faculty members on meaningful projects. Complete tasks posted by teachers, gain valuable hands-on experience, and earn credit points for your academic record.
                     </p>
                   </div>
                 </div>
                 <div className="flex-1 bg-brand-dark/50 rounded-2xl border border-white/5 p-6 relative overflow-hidden group-hover:border-brand-accent/20 transition-colors hidden sm:block">
                    <div className="absolute top-4 right-4 text-white/5"><Briefcase size={120} /></div>
                    <div className="relative z-10 space-y-4 pt-12">
                      <div className="h-2 w-1/3 bg-white/10 rounded"></div>
                      <div className="h-2 w-3/4 bg-white/5 rounded"></div>
                      <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Card 2 */}
            <div className="md:col-span-4 group bg-[#291754]/40 border border-white/10 hover:border-brand-accent/50 rounded-3xl p-8 transition-all duration-300 flex flex-col">
               <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                 <Users size={28} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">Student Tasks</h3>
               <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4 w-max">Help Peers</span>
               <p className="text-gray-400 leading-relaxed flex-1">
                 Collaborate with fellow students on projects. Build your portfolio and expand your college network.
               </p>
            </div>

            {/* Card 3 */}
            <div className="md:col-span-12 group bg-gradient-to-r from-brand-surface to-[#291754]/30 border border-white/10 hover:border-white/20 rounded-3xl p-8 md:p-10 transition-all duration-300 mt-2">
               <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                 <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 bg-brand-dark">
                     <Award size={32} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-white mb-1">Skill Showcase</h3>
                     <p className="text-gray-400">Display your skills to attract opportunities from the outside.</p>
                   </div>
                 </div>
                 <Link to="/profile" className="flex items-center gap-2 text-white hover:text-brand-accent transition-colors font-medium">
                   Build your profile <ArrowRight size={20} />
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Redesigned */}
      <section className="py-24 bg-brand-surface" id="how-it-works">
        <div className="wrapper">
          <div className="text-center mb-16">
            <span className="text-brand-accent font-semibold tracking-wider uppercase text-sm mb-4 block">Workflow</span>
            <h2 className="text-4xl font-display font-bold text-white mb-6">How Synapze Works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">A seamless experience connecting ambition with opportunity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative mt-16">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>

            {[
               { step: '1', title: 'Find or Post', desc: 'Discover meaningful tasks or post opportunities for the community.', icon: Zap },
               { step: '2', title: 'Collaborate', desc: 'Use integrated chat to align on requirements and share progress.', icon: Users },
               { step: '3', title: 'Achieve', desc: 'Submit deliverables, earn points, and build your reputation.', icon: CheckCircle }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                 <div className="w-24 h-24 rounded-3xl bg-brand-dark border border-white/10 flex items-center justify-center shadow-lg group-hover:border-brand-accent/50 group-hover:-translate-y-2 transition-all duration-300 mb-8 relative">
                    <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center font-bold text-sm border-2 border-brand-dark shadow-md">
                      {item.step}
                    </span>
                    <item.icon size={32} className="text-gray-300 group-hover:text-white transition-colors" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                 <p className="text-gray-400 leading-relaxed px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Redesigned */}
      <section className="py-24 relative overflow-hidden bg-brand-dark">
         <div className="absolute inset-0 bg-gradient-to-t from-[#291754]/20 to-transparent"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-brand-accent/10 blur-[100px] rounded-full pointer-events-none"></div>
         
         <div className="wrapper relative z-10">
            <div className="bg-brand-surface/40 border border-white/10 backdrop-blur-md rounded-[3rem] p-10 md:p-20 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-50"></div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight relative z-10">
                 Ready to make an <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-blue-400">impact?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed relative z-10">
                 Join hundreds of students and teachers already using Synapze to innovate, collaborate, and grow.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link to="/register" className="btn bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                   Create Free Account
                </Link>
                <Link to="/browse" className="btn bg-transparent border border-white/20 text-white hover:bg-white/5 px-8 py-4 text-lg font-semibold">
                   Explore Platform
                </Link>
              </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;



