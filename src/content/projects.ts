import type { Project } from './profile';

export const projects = [
  {
    slug: 'fraud-detection-platform',
    content: {
      en: {
        name: 'Fraud Detection Platform',
        summary:
          'Real-time, event-driven fraud detection and risk intelligence platform for secure financial operations, featuring explainable risk scoring, intelligent alerts and auditable investigation workflows.',
      },
      pl: {
        name: 'Fraud Detection Platform',
        summary:
          'Platforma wykrywania nadużyć i analizy ryzyka w czasie rzeczywistym, oparta na zdarzeniach i wspierająca bezpieczne operacje finansowe. Obejmuje wyjaśnialną ocenę ryzyka, inteligentne alerty i audytowalne procesy analizy spraw.',
      },
    },
    technologies: [
      'Java',
      'JavaScript',
      'Python',
      'Spring Boot',
      'Maven',
      'Kafka',
      'Redis',
      'MongoDB',
      'React',
      'Docker Compose',
      'Keycloak/OIDC',
      'Prometheus',
      'Grafana',
      'Testcontainers',
    ],
    repositoryUrl: 'https://github.com/MiloszPodsiadly/fraud-detection-platform',
    asset: '/assets/projects/fraud-emblem.webp',
  },
  {
    slug: 'stockrescue-ai',
    content: {
      en: {
        name: 'StockRescue AI',
        summary:
          'AI-driven inventory intelligence platform designed to help retailers reduce food waste, optimize stock allocation, and make smarter inventory decisions.',
      },
      pl: {
        name: 'StockRescue AI',
        summary:
          'Platforma inteligentnego zarządzania zapasami oparta na AI, zaprojektowana, aby pomagać sprzedawcom ograniczać marnowanie żywności, optymalizować rozmieszczenie towarów i podejmować trafniejsze decyzje dotyczące zapasów.',
      },
    },
    technologies: [
      'Java',
      'TypeScript',
      'Python',
      'Spring Boot',
      'React',
      'Tailwind CSS',
      'Apache Kafka',
      'PostgreSQL',
      'Flyway',
      'Docker Compose',
      'Gradle',
      'Spring Security',
      'Testcontainers',
      'Playwright',
    ],
    repositoryUrl: 'https://github.com/MiloszPodsiadly/StockRescue',
    asset: '/assets/projects/stock-emblem.webp',
  },
  {
    slug: 'chess-project',
    content: {
      en: {
        name: 'Chess Project',
        summary:
          'Where strategy meets tradition. Every move matters. Shape the game with precision.',
      },
      pl: {
        name: 'Chess Project',
        summary:
          'Tu strategia spotyka się z tradycją. Każdy ruch ma znaczenie. Kształtuj grę z precyzją.',
      },
    },
    technologies: [
      'Java',
      'TypeScript',
      'Angular',
      'Spring Boot',
      'Stockfish',
      'Chess.js',
      'WebSocket/STOMP',
      'PostgreSQL',
      'Spring Security',
      'Flyway',
      'Docker Compose',
      'Gradle',
      'Nginx',
      'JUnit 5',
      'Playwright',
    ],
    repositoryUrl: 'https://github.com/MiloszPodsiadly/chess-project',
    asset: '/assets/projects/chess-emblem.webp',
  },
  {
    slug: 'library',
    content: {
      en: {
        name: 'Library',
        summary:
          'The first project featured in my portfolio — an independently built Java backend developed while learning software engineering best practices.',
      },
      pl: {
        name: 'Library',
        summary:
          'Pierwszy projekt w moim portfolio — samodzielnie zbudowany backend w Javie, rozwijany podczas nauki dobrych praktyk inżynierii oprogramowania.',
      },
    },
    technologies: [
      'Java',
      'Spring Boot',
      'Spring Data JPA',
      'Hibernate',
      'MySQL',
      'Spring Security',
      'REST API',
      'H2 Database',
      'Docker Compose',
      'Gradle',
      'JUnit',
      'Mockito',
      'Lombok',
    ],
    repositoryUrl: 'https://github.com/MiloszPodsiadly/Library',
    asset: '/assets/projects/library-emblem.webp',
  },
] as const satisfies readonly Project[];
