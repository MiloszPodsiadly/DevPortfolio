import type { Project } from './profile';

export const projects = [
  {
    slug: 'fraud-detection-platform',
    content: {
      en: {
        name: 'Fraud Detection Platform',
        summary:
          'A multi-service project exploring transaction processing, fraud-risk scoring and analyst workflows.',
        problem:
          'Transaction risk signals and review workflows can span several services and data paths.',
        solution:
          'Connects transaction ingestion, rule- and ML-supported scoring, alerts and case review through an event-driven architecture.',
        role: 'Personal project',
      },
      pl: {
        name: 'Fraud Detection Platform',
        summary:
          'Wielousługowy projekt rozwijający przetwarzanie transakcji, ocenę ryzyka nadużyć i obsługę alertów.',
        problem:
          'Sygnały ryzyka transakcji i proces ich analizy mogą przebiegać przez wiele usług i źródeł danych.',
        solution:
          'Łączy przyjmowanie transakcji, ocenę opartą na regułach i modelach ML, alerty oraz analizę spraw w architekturze zdarzeniowej.',
        role: 'Projekt własny',
      },
    },
    technologies: ['Java', 'Spring Boot', 'Apache Kafka', 'Python', 'React'],
    repositoryUrl: 'https://github.com/MiloszPodsiadly/fraud-detection-platform',
    asset: '/assets/projects/fraud-signals.svg',
    publicationStatus: 'published',
  },
  {
    slug: 'stockrescue-ai',
    content: {
      en: {
        name: 'StockRescue AI',
        summary:
          'An inventory-management project in development, aimed at helping small retail chains reduce avoidable food waste.',
        problem:
          'Surplus and near-expiry stock can be difficult to coordinate between store locations.',
        solution:
          'The project is developing shared workflows for inventory, product batches and stock movement between stores.',
        role: 'Personal project',
      },
      pl: {
        name: 'StockRescue AI',
        summary:
          'Rozwijany projekt do zarządzania zapasami, którego celem jest ograniczenie możliwego do uniknięcia marnowania żywności.',
        problem:
          'Nadwyżki i produkty z krótkim terminem przydatności trudno koordynować między sklepami.',
        solution:
          'Projekt rozwija wspólne procesy obsługi zapasów, partii produktów i przepływu towarów między sklepami.',
        role: 'Projekt własny',
      },
    },
    technologies: ['Java', 'Spring Boot', 'Python', 'FastAPI', 'PostgreSQL', 'React', 'TypeScript'],
    repositoryUrl: 'https://github.com/MiloszPodsiadly/StockRescue',
    asset: '/assets/projects/stock-rescue.svg',
    publicationStatus: 'published',
  },
  {
    slug: 'chess-project',
    content: {
      en: {
        name: 'Chess Project',
        summary:
          'A bilingual chess app for local games, Stockfish analysis and online multiplayer.',
        problem:
          'Players often need separate tools for local chess, engine practice and online matches.',
        solution:
          'Brings local play, Stockfish engine options and online rooms together in an English and Polish interface.',
        role: 'Personal project',
      },
      pl: {
        name: 'Chess Project',
        summary:
          'Dwujęzyczna aplikacja szachowa z grą lokalną, analizą Stockfish i rozgrywkami online.',
        problem:
          'Do gry lokalnej, ćwiczeń z silnikiem i partii online często potrzeba osobnych narzędzi.',
        solution:
          'Łączy grę lokalną, tryby silnika Stockfish i pokoje online w interfejsie po polsku i angielsku.',
        role: 'Projekt własny',
      },
    },
    technologies: [
      'Angular',
      'TypeScript',
      'Java',
      'Spring Boot',
      'PostgreSQL',
      'Stockfish.js',
      'Docker Compose',
    ],
    repositoryUrl: 'https://github.com/MiloszPodsiadly/chess-project',
    asset: '/assets/projects/chess-piece.svg',
    publicationStatus: 'published',
  },
] as const satisfies readonly Project[];
