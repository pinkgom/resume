import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { FaUser, FaCode, FaCog, FaRocket, FaLaptopCode } from 'react-icons/fa'

const Timeline = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState(null)
  const timelineRef = useRef(null)
  const isInView = useInView(timelineRef, { once: false, amount: 0.2 })

  // Debug: projects 데이터 확인
  console.log('Timeline projects:', projects)

  // projects가 없거나 빈 배열인 경우 처리
  if (!projects || projects.length === 0) {
    return (
      <section id="timeline" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Project History</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              프로젝트 데이터를 불러오는 중...
            </p>
          </div>
        </div>
      </section>
    )
  }

  // 프로젝트를 최신순으로 정렬 (기간 기준)
  const sortedProjects = [...projects]
    .filter(project => project.period) // period가 있는 프로젝트만
    .sort((a, b) => {
      // period에서 연도 추출하여 내림차순 정렬
      const getYear = (period) => {
        const match = period.match(/(\d{4})/)
        return match ? parseInt(match[1]) : 0
      }
      return getYear(b.period) - getYear(a.period)
    })

  const getRoleIcon = (role) => {
    if (role.includes('Manager')) return FaUser
    if (role.includes('Developer')) return FaCode
    if (role.includes('DevOps')) return FaCog
    if (role.includes('Architect')) return FaRocket
    return FaLaptopCode
  }

  const getRoleColor = (role) => {
    if (role.includes('Manager')) return 'text-red-500'
    if (role.includes('Developer')) return 'text-green-500'
    if (role.includes('DevOps')) return 'text-blue-500'
    if (role.includes('Architect')) return 'text-purple-500'
    return 'text-gray-500'
  }

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
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="timeline" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Project History</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            지난 20년간의 프로젝트 경험과 성장 과정
          </p>
        </motion.div>

        <div ref={timelineRef} className="max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative"
          >
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transform md:-translate-x-1/2" />

            {sortedProjects.map((project, index) => {
              const IconComponent = getRoleIcon(project.role)
              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className={`relative flex items-center mb-12 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline Node */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={`absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-500 flex items-center justify-center z-10 cursor-pointer ${
                      selectedProject === project.id ? 'ring-4 ring-blue-300 dark:ring-blue-700' : ''
                    }`}
                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                  >
                    <IconComponent className={`text-xl ${getRoleColor(project.role)}`} />
                  </motion.div>

                  {/* Content Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`w-full md:w-5/12 ${
                      isEven 
                        ? 'ml-24 md:ml-0 md:mr-auto md:pr-8' 
                        : 'ml-24 md:ml-auto md:pl-8'
                    }`}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700">
                      {/* Period */}
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        {project.period}
                      </div>

                      {/* Project Name */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {project.name}
                      </h3>

                      {/* Role Badge */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mb-3">
                        <IconComponent className="mr-1" />
                        {project.role}
                      </div>

                      {/* Status Badge */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-2 mb-3 ${
                        project.status === 'Complete' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {project.status === 'Complete' ? '완료' : '진행중'}
                      </div>

                      {/* Description Preview */}
                      {project.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                          {Array.isArray(project.description) 
                            ? project.description[0] 
                            : project.description}
                        </p>
                      )}
                      
                      {/* 프로젝트에 description이 없을 때 기본 메시지 */}
                      {!project.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                          프로젝트 진행중...
                        </p>
                      )}

                      {/* Expand/Collapse for Details */}
                      <motion.div
                        initial={false}
                        animate={{ height: selectedProject === project.id ? 'auto' : 0 }}
                        className="overflow-hidden"
                      >
                        {selectedProject === project.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4"
                          >
                            {/* Full Description */}
                            {project.description && Array.isArray(project.description) && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">프로젝트 개요</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                  {project.description.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Tasks */}
                            {project.tasks && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">주요 업무</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                  {project.tasks.map((task, idx) => (
                                    <li key={idx}>{task}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Tech Stack */}
                            {project.techStack && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">기술 스택</h4>
                                <div className="flex flex-wrap gap-2">
                                  {project.techStack.split(', ').map((tech, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Links */}
                            {(project.links?.blog || project.links?.website) && (
                              <div className="flex gap-2">
                                {project.links.blog && (
                                  <a
                                    href={project.links.blog}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                  >
                                    블로그
                                  </a>
                                )}
                                {project.links.website && (
                                  <a
                                    href={project.links.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                  >
                                    웹사이트
                                  </a>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>

                      {/* View More Button */}
                      <button
                        onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                        className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                      >
                        {selectedProject === project.id ? '접기' : '자세히 보기'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Timeline