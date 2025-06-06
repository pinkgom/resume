import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExternalLinkAlt, FaGithub, FaPlay, FaAndroid, FaApple } from 'react-icons/fa'
import { HiOutlineFilter } from 'react-icons/hi'

const Projects = ({ projects, selectedCategory, setSelectedCategory }) => {
  const [selectedProject, setSelectedProject] = useState(null)

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (selectedProject) {
          setSelectedProject(null)
        }
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [selectedProject])

  // Get unique categories from projects
  const categories = ['all', ...new Set(projects.map(project => {
    if (project.role.includes('Manager')) return 'management'
    if (project.role.includes('Developer')) return 'development'
    if (project.role.includes('DevOps')) return 'devops'
    if (project.role.includes('Architect')) return 'architecture'
    return 'other'
  }))]

  const categoryLabels = {
    all: '전체',
    management: '프로젝트 관리',
    development: '개발',
    devops: 'DevOps',
    architecture: '아키텍처',
    other: '기타'
  }

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => {
        if (selectedCategory === 'management') return project.role.includes('Manager')
        if (selectedCategory === 'development') return project.role.includes('Developer')
        if (selectedCategory === 'devops') return project.role.includes('DevOps')
        if (selectedCategory === 'architecture') return project.role.includes('Architect')
        return false
      })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const ProjectModal = ({ project, onClose }) => {
    if (!project) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Project Images */}
            {project.images && project.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {project.images.map((image, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group">
                    <img
                      src={image.src}
                      alt={image.title || `Project image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2">
                      <p className="text-center">{image.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Project Details */}
            <div className="space-y-4">
              {project.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">프로젝트 개요</h4>
                  {Array.isArray(project.description) ? (
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                      {project.description.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
                  )}
                </div>
              )}

              {project.tasks && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">주요 업무</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    {project.tasks.map((task, idx) => <li key={idx}>{task}</li>)}
                  </ul>
                </div>
              )}

              {project.techStack && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">기술 스택</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.split(', ').map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            다양한 분야의 프로젝트 경험과 성과
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <HiOutlineFilter className="text-gray-400 mt-2 mr-2" />
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
              }`}
            >
              {categoryLabels[category]}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div
          key={selectedCategory} // 필터 변경 시 전체 그리드 재렌더링
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={`${selectedCategory}-${project.id}`} // 카테고리별 고유 키
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
                {/* Project Image */}
                {project.images && project.images[0] && (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={project.images[0].src}
                      alt={project.images[0].title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Period & Status */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {project.period}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'Complete'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {project.status === 'Complete' ? '완료' : '진행중'}
                    </span>
                  </div>

                  {/* Project Name */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {project.name}
                  </h3>

                  {/* Role */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mb-3">
                    {project.role}
                  </div>

                  {/* Description Preview */}
                  {project.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                      {Array.isArray(project.description) 
                        ? project.description[0] 
                        : project.description}
                    </p>
                  )}

                  {/* Tech Stack Preview */}
                  {project.techStack && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.techStack.split(', ').slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.split(', ').length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{project.techStack.split(', ').length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {project.links?.blog && (
                        <a
                          href={project.links.blog}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <FaExternalLinkAlt size={14} />
                        </a>
                      )}
                      {project.links?.website && (
                        <a
                          href={project.links.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        >
                          <FaPlay size={14} />
                        </a>
                      )}
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      자세히 보기 →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
        </motion.div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

export default Projects