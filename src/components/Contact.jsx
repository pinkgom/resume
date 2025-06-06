import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLinkedin, FaGithub, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { HiOutlineExternalLink } from 'react-icons/hi'

const Contact = ({ personalInfo }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create mailto link with form data
    const subject = encodeURIComponent(formData.subject || '포트폴리오 문의')
    const body = encodeURIComponent(
      `안녕하세요 ${personalInfo.name}님,\n\n` +
      `보내는 사람: ${formData.name}\n` +
      `이메일: ${formData.email}\n\n` +
      `메시지:\n${formData.message}\n\n` +
      `감사합니다.`
    )
    
    const mailtoLink = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`
    window.location.href = mailtoLink
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactMethods = [
    {
      icon: FaEnvelope,
      title: '이메일',
      value: personalInfo.email,
      link: `mailto:${personalInfo.email}`,
      color: 'text-red-500'
    },
    {
      icon: HiOutlineExternalLink,
      title: '블로그',
      value: 'Brunch',
      link: personalInfo.blog,
      color: 'text-green-500'
    },
    {
      icon: FaMapMarkerAlt,
      title: '위치',
      value: personalInfo.location,
      link: null,
      color: 'text-blue-500'
    }
  ]

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

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Get In Touch</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            새로운 프로젝트나 협업에 대한 문의를 기다리고 있습니다
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  연락처 정보
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  언제든지 연락주세요. 새로운 기회와 도전을 기다리고 있습니다.
                </p>
              </motion.div>

              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={method.title}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    className="flex items-center"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center mr-4 shadow-md ${method.color}`}>
                      <method.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {method.title}
                      </h4>
                      {method.link ? (
                        <a
                          href={method.link}
                          target={method.link.startsWith('http') ? '_blank' : '_self'}
                          rel={method.link.startsWith('http') ? 'noopener noreferrer' : ''}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {method.value}
                        </a>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-300">
                          {method.value}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Section */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
              >
                <h4 className="text-lg font-bold mb-2">함께 일해요!</h4>
                <p className="mb-4 opacity-90">
                  혁신적인 프로젝트를 함께 만들어가고 싶습니다
                </p>
                <motion.a
                  href={`mailto:${personalInfo.email}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <FaEnvelope className="mr-2" />
                  이메일 보내기
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                메시지 보내기
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                      placeholder="홍길동"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    placeholder="프로젝트 협업 문의"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    메시지
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors resize-none"
                    placeholder="안녕하세요. 프로젝트 협업에 대해 문의드립니다..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  메시지 보내기
                </motion.button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  위 폼을 제출하면 기본 메일 앱이 열립니다
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 {personalInfo.name}. Made with ❤️ using React & Tailwind CSS
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact