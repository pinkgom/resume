import React from "react";
import { motion } from "framer-motion";
import { FaReact, FaNodeJs, FaPython, FaJava, FaDocker, FaAws } from "react-icons/fa";
import { SiTypescript, SiKubernetes, SiMongodb, SiPostgresql, SiRedis, SiElasticsearch } from "react-icons/si";

const Skills = ({ projects }) => {
    // Extract tech stack from projects
    const extractTechStack = () => {
        const techMap = new Map();

        projects.forEach((project) => {
            if (project.techStack) {
                const techs = project.techStack.split(", ");
                techs.forEach((tech) => {
                    const normalizedTech = tech.trim().toLowerCase();
                    const count = techMap.get(normalizedTech) || 0;
                    techMap.set(normalizedTech, count + 1);
                });
            }
        });

        return Array.from(techMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);
    };

    const techStack = extractTechStack();

    const getTechIcon = (tech) => {
        const lowerTech = tech.toLowerCase();
        if (lowerTech.includes("react")) return FaReact;
        if (lowerTech.includes("node")) return FaNodeJs;
        if (lowerTech.includes("python")) return FaPython;
        if (lowerTech.includes("java")) return FaJava;
        if (lowerTech.includes("docker")) return FaDocker;
        if (lowerTech.includes("aws")) return FaAws;
        if (lowerTech.includes("typescript")) return SiTypescript;
        if (lowerTech.includes("kubernetes")) return SiKubernetes;
        if (lowerTech.includes("mongodb")) return SiMongodb;
        if (lowerTech.includes("postgresql")) return SiPostgresql;
        if (lowerTech.includes("redis")) return SiRedis;
        if (lowerTech.includes("elasticsearch")) return SiElasticsearch;
        return null;
    };

    const getTechColor = (tech) => {
        const lowerTech = tech.toLowerCase();
        if (lowerTech.includes("react")) return "text-blue-500";
        if (lowerTech.includes("node")) return "text-green-500";
        if (lowerTech.includes("python")) return "text-yellow-500";
        if (lowerTech.includes("java")) return "text-red-500";
        if (lowerTech.includes("docker")) return "text-blue-600";
        if (lowerTech.includes("aws")) return "text-orange-500";
        if (lowerTech.includes("typescript")) return "text-blue-700";
        if (lowerTech.includes("kubernetes")) return "text-purple-500";
        return "text-gray-600 dark:text-gray-400";
    };

    const skillCategories = [
        {
            title: "프론트엔드",
            skills: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Vue.js"],
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "백엔드",
            skills: ["Node.js", "Python", "Java", "Spring", "Express"],
            color: "from-green-500 to-emerald-500",
        },
        {
            title: "데이터베이스",
            skills: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch"],
            color: "from-purple-500 to-pink-500",
        },
        {
            title: "DevOps & 클라우드",
            skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
            color: "from-orange-500 to-red-500",
        },
        {
            title: "도구 & 기타",
            skills: ["Git", "JIRA", "Figma", "Slack", "VS Code"],
            color: "from-gray-500 to-slate-500",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <section id="skills" className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Skills & Technologies</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">오랜 경험을 통해 습득한 다양한 기술 스택과 도구들</p>
                </motion.div>

                {/* Skill Categories */}
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {skillCategories.map((category, index) => (
                        <motion.div
                            key={category.title}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{category.title}</h3>
                            <div className="space-y-2">
                                {category.skills.map((skill, skillIndex) => (
                                    <div key={skill} className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color} mr-3`} />
                                        <span className="text-gray-700 dark:text-gray-300">{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tech Stack Cloud */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">프로젝트에서 사용한 기술들</h3>
                    <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                        {techStack.map(([tech, count], index) => {
                            const IconComponent = getTechIcon(tech);
                            const size = Math.max(16, Math.min(32, count * 4));

                            return (
                                <motion.div
                                    key={tech}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.1 }}
                                    className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                                    style={{ fontSize: `${size}px` }}
                                >
                                    {IconComponent && <IconComponent className={`mr-2 ${getTechColor(tech)}`} />}
                                    <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">{tech}</span>
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{count}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Experience Stats */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">20+</div>
                        <div className="text-gray-600 dark:text-gray-300">년 경력</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{projects.length}</div>
                        <div className="text-gray-600 dark:text-gray-300">완료 프로젝트</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{techStack.length}+</div>
                        <div className="text-gray-600 dark:text-gray-300">기술 스택</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">100%</div>
                        <div className="text-gray-600 dark:text-gray-300">성공률</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Skills;
