# 안경찬 포트폴리오

> React 기반의 모던하고 인터랙티브한 포트폴리오 웹사이트

## 🚀 주요 기능

- **모던 UI/UX**: React, Tailwind CSS를 활용한 현대적 디자인
- **다크모드 지원**: 라이트/다크 테마 자동 전환
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험
- **인터랙티브 타임라인**: 프로젝트 히스토리를 시각적으로 표현
- **애니메이션 효과**: Framer Motion을 활용한 부드러운 전환 효과
- **프로젝트 필터링**: 카테고리별 프로젝트 분류 및 검색
- **스킬 시각화**: 기술 스택을 직관적으로 표현

## 🛠 기술 스택

### Frontend
- **React 18** - 컴포넌트 기반 UI 라이브러리
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Framer Motion** - 애니메이션 라이브러리
- **React Icons** - 아이콘 라이브러리

### Tools & Build
- **PostCSS** - CSS 후처리기
- **Autoprefixer** - 브라우저 호환성
- **gh-pages** - GitHub Pages 자동 배포

## 📁 프로젝트 구조

```
resume/
├── CLAUDE.md             # 프로젝트 가이드
├── README.md             # 프로젝트 설명
├── data/
│   └── portfolio-data.json  # 포트폴리오 데이터
├── public/
│   └── images/           # 프로젝트 이미지
├── src/
│   ├── components/       # React 컴포넌트
│   │   ├── Navigation.jsx
│   │   ├── Hero.jsx
│   │   ├── Timeline.jsx
│   │   ├── Projects.jsx
│   │   ├── Skills.jsx
│   │   ├── Contact.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── ScrollToTop.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 시작하기

### 설치

```bash
git clone https://github.com/pinkgom/resume.git
cd resume
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:3000에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

### GitHub Pages 배포

```bash
npm run deploy
```

## 📊 주요 개선사항

### 기존 HTML 포트폴리오 대비 개선점

1. **성능 향상**
   - React 18의 Concurrent Features 활용
   - Vite의 빠른 HMR (Hot Module Replacement)
   - 이미지 lazy loading 및 최적화
   - 컴포넌트 기반으로 효율적인 렌더링

2. **사용자 경험 개선**
   - Framer Motion을 활용한 부드러운 애니메이션
   - 인터랙티브 타임라인 및 프로젝트 필터링
   - 다크모드 지원으로 사용자 환경 개선
   - 모바일 우선 반응형 디자인

3. **접근성 및 SEO**
   - 시맨틱 HTML 구조
   - 키보드 네비게이션 지원 (ESC 키로 모달 닫기 등)
   - 검색 엔진 최적화

4. **유지보수성**
   - 컴포넌트 기반 아키텍처로 재사용성 향상
   - JSON 데이터 기반 콘텐츠 관리로 쉬운 업데이트
   - 모던 개발 환경 (Vite + React + Tailwind)

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Blue (500-700)
- **Secondary**: Purple (500-700)
- **Accent**: Cyan, Green, Orange
- **Neutral**: Gray (50-900)

### 타이포그래피
- **Font Family**: Inter, Noto Sans KR
- **Sizes**: text-sm ~ text-7xl
- **Weights**: 300 ~ 900

### 컴포넌트
- **Cards**: 둥근 모서리, 그림자 효과
- **Buttons**: 그라디언트, 호버 효과
- **Timeline**: 인터랙티브 노드, 색상 코딩

## 📱 반응형 디자인

- **Mobile**: < 768px
- **Tablet**: 768px ~ 1024px
- **Desktop**: > 1024px

모든 컴포넌트는 모바일 우선 설계로 제작되었습니다.

## 🔧 커스터마이징

### 포트폴리오 데이터 수정

`data/portfolio-data.json` 파일을 수정하여 개인 정보 및 프로젝트 정보를 업데이트할 수 있습니다.

### 스타일 수정

`tailwind.config.js`에서 색상, 폰트, 애니메이션 등을 커스터마이징할 수 있습니다.

### 컴포넌트 추가

`src/components/` 디렉토리에 새로운 컴포넌트를 추가하고 `App.jsx`에서 임포트하여 사용할 수 있습니다.

## 📄 라이선스

MIT License

## 👨‍💻 개발자

**안경찬** - Software Architect / Fullstack Developer / IT Instructor

- Email: joypinkgom@gmail.com
- Blog: https://brunch.co.kr/@joypinkgom
- Portfolio: https://pinkgom.github.io/resume