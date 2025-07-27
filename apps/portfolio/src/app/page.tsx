import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Frontend Developer
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Crafting beautiful, responsive user interfaces with Next.js, React & Tailwind CSS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#projects" 
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              View My Work
            </Link>
            <Link 
              href="#contact" 
              className="px-8 py-3 border-2 border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Get In Touch
            </Link>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-4 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Technical Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Frontend Development",
                skills: ["React.js", "Next.js", "TypeScript", "JavaScript"],
                icon: "⚛️"
              },
              {
                title: "Styling & Design",
                skills: ["Tailwind CSS", "CSS3", "Responsive Design", "UI/UX"],
                icon: "🎨"
              },
              {
                title: "Backend & Deployment",
                skills: ["Node.js", "AWS", "Vercel", "API Development"],
                icon: "🚀"
              },
              {
                title: "Development Tools",
                skills: ["Git", "ESLint", "Webpack", "Turbo Repo"],
                icon: "🛠️"
              },
              {
                title: "Performance",
                skills: ["SEO", "Core Web Vitals", "Optimization", "Testing"],
                icon: "⚡"
              },
              {
                title: "Experience",
                skills: ["4.5+ Years", "Remote Work", "Team Leadership", "Agile"],
                icon: "💼"
              }
            ].map((category, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-4">{category.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <span 
                      key={skillIndex}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "E-Commerce Platform",
                description: "Full-stack e-commerce solution with Next.js, Stripe integration, and AWS deployment",
                tech: ["Next.js", "Stripe", "AWS", "Tailwind"],
                image: "/api/placeholder/400/300"
              },
              {
                title: "Dashboard Analytics",
                description: "Real-time analytics dashboard with interactive charts and data visualization",
                tech: ["React", "D3.js", "Node.js", "WebSocket"],
                image: "/api/placeholder/400/300"
              },
              {
                title: "Portfolio Website",
                description: "Modern portfolio built with Next.js, TypeScript, and responsive design",
                tech: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
                image: "/api/placeholder/400/300"
              }
            ].map((project, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-6xl opacity-50">📱</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Work Together?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            I&apos;m available for remote opportunities and freelance projects. 
            Let&apos;s discuss how I can help bring your ideas to life.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">💼</div>
              <h3 className="text-xl font-semibold text-white mb-2">Full-Time Remote</h3>
              <p className="text-gray-300 text-sm">Looking for $25-30/hr remote positions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Freelance Projects</h3>
              <p className="text-gray-300 text-sm">Available for contract work</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">Consulting</h3>
              <p className="text-gray-300 text-sm">Technical guidance and optimization</p>
            </div>
          </div>
          <div className="mt-12">
            <Link 
              href="mailto:your.email@example.com" 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
