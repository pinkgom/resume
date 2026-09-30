# 안경찬 포트폴리오

> 2002년부터의 프로젝트를 역할별 타임라인과 기록 목록으로 보여 주는 공개 프로필 페이지

공개 주소: https://pinkgom.github.io/resume

## 구성

- **머리**: 이름, 직함, 소개, 연락 링크
- **타임라인**: 역할별 5개 트랙(PM, 아키텍트, 개발, 운영, 강의)에 프로젝트를 클립으로 올린 도표. 빨간 세로선이 오늘이고, 빗금은 예정된 기간이다. 클립을 누르면 해당 기록으로 이동한다.
- **기록**: 모든 프로젝트의 단일 목록. 행을 누르면 그 자리에서 펼쳐진다. 기록마다 주소가 있다(예: `#project_magic`).
- **기술**: 프로젝트 데이터에서 자동 집계한 색인. 기술이나 트랙 이름을 누르면 기록을 걸러 본다.
- **연락**: 이메일, 브런치, 위치

밝은 화면과 어두운 화면을 지원하고, 처음에는 시스템 설정을 따른다.

## 기술 스택

- React 18, Vite 5, Tailwind CSS 3
- Vitest, Testing Library (테스트)
- GitHub Pages (배포)

애니메이션 라이브러리는 쓰지 않는다. 움직임은 페이지를 열 때 플레이헤드가 한 번 지나가는 것뿐이고 CSS로 구현했다.

## 프로젝트 구조

```
resume/
├── data/
│   └── portfolio-data.json     # 모든 콘텐츠
├── public/images/              # 프로필, 프로젝트 화면
├── src/
│   ├── utils/
│   │   └── career.js           # 기간 해석, 트랙 분류, 타임라인 구성, 기술 색인, 걸러 보기
│   ├── components/
│   │   ├── Header.jsx          # 소개 영역
│   │   ├── CareerTimeline.jsx  # 타임라인
│   │   ├── Ledger.jsx          # 기록 목록
│   │   ├── LedgerEntry.jsx     # 기록 한 행과 펼친 내용
│   │   ├── ImageViewer.jsx     # 화면 크게 보기
│   │   ├── TechIndex.jsx       # 기술 색인
│   │   ├── Footer.jsx          # 연락
│   │   ├── ThemeToggle.jsx     # 어두운 화면 전환
│   │   └── trackStyles.js      # 트랙 색 클래스
│   ├── App.jsx                 # 상태와 조립
│   ├── main.jsx
│   └── index.css               # 색 토큰, 타임라인 스타일
├── docs/superpowers/           # 설계 스펙과 구현 계획
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## 시작하기

```bash
git clone https://github.com/pinkgom/resume.git
cd resume
npm install
npm run dev      # http://localhost:3000
```

```bash
npm test         # 테스트
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 콘텐츠 수정

모든 내용은 `data/portfolio-data.json`에 있다. 프로젝트를 추가하려면 `projects` 배열 맨 앞에 항목을 넣는다.

```json
{
    "id": "project_example",
    "name": "프로젝트 이름",
    "nameEn": "Project Name",
    "period": "2027.01 - 진행중",
    "status": "In progress",
    "role": "Project Manager, Fullstack Developer",
    "description": ["개요 한 줄"],
    "tasks": ["주요 업무 한 줄"],
    "techStack": "FastAPI, NextJs",
    "images": [{ "src": "images/projects/example.png", "title": "화면 제목" }],
    "links": { "blog": "https://...", "website": "https://..." }
}
```

- `period`는 `2024.01 ~ 2024.12` 또는 `2027.01 - 진행중` 형식으로 적는다. 다른 형식이면 기록에는 적은 그대로 나오고 타임라인에서는 빠진다.
- `role`의 각 역할은 단어로 트랙이 정해진다: Manager·Leader → PM, Architect → 아키텍트, Developer → 개발, DevOps·Operator·QA·Maintenance → 운영, Instructor → 강의. 새 단어를 쓰려면 `src/utils/career.js`의 `TRACKS`에 추가한다.
- `links`의 키는 `blog`, `website`, `youtube`, `android`, `ios`. `blog`는 배열도 된다.
- 개발 서버에서는 타임라인에 올라가지 못한 프로젝트가 콘솔 경고로 나온다.

## 디자인

- 색과 서체는 `src/index.css`의 CSS 변수와 `tailwind.config.js`에 정의되어 있다.
- 서체: Hahmlet(이름, 제목, 프로젝트명), IBM Plex Sans KR(본문)
- 트랙 색 5가지는 역할을 뜻할 때만 쓴다. 빨간색은 오늘을 가리키는 선에만 쓴다.
- 자세한 원칙은 `docs/superpowers/specs/2026-09-30-portfolio-redesign-design.md` 참조. 색을 바꾸면 `npm test`가 대비 기준(글자 4.5:1, 표시 3:1)을 검사한다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 GitHub Pages에 배포한다. 공개 사이트이므로 작업은 브랜치에서 하고 확인 후 병합한다.

## 라이선스

MIT License

## 연락

**안경찬**

- Email: joypinkgom@gmail.com
- Blog: https://brunch.co.kr/@joypinkgom
