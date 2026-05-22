/** Coach filmstrip cards — editorial landing (Lando-style reel). */
export type CoachReelCard = {
  id: string;
  name: string;
  city: string;
  specialty: string;
  rating: number;
  sessions: number;
  image: string;
};

export const COACH_REEL: CoachReelCard[] = [
  {
    id: "t-001",
    name: "Tomás Mendes",
    city: "Lisboa",
    specialty: "Força & Condicionamento",
    rating: 4.97,
    sessions: 124,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=560&q=80"
  },
  {
    id: "t-002",
    name: "Ana Pereira",
    city: "Porto",
    specialty: "Yoga & Mobilidade",
    rating: 4.98,
    sessions: 89,
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=560&q=80"
  },
  {
    id: "t-003",
    name: "Rui Fonseca",
    city: "Cascais",
    specialty: "Natação",
    rating: 4.95,
    sessions: 76,
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=560&q=80"
  },
  {
    id: "t-004",
    name: "Sónia Martins",
    city: "Braga",
    specialty: "Triathlon",
    rating: 4.96,
    sessions: 102,
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=560&q=80"
  },
  {
    id: "t-005",
    name: "Pedro Costa",
    city: "Coimbra",
    specialty: "Ciclismo",
    rating: 4.94,
    sessions: 68,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=560&q=80"
  },
  {
    id: "t-006",
    name: "Marina Alves",
    city: "Lisboa",
    specialty: "Yoga · Multi-sport",
    rating: 4.99,
    sessions: 156,
    image:
      "https://images.unsplash.com/photo-1599901860904-17e06ed70836?auto=format&fit=crop&w=560&q=80"
  }
];

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80";
