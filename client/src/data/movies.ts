export interface Movie {
  id: number;
  title: string;
  genre: string;
  category: string;
  language: string;
  releaseDate: string;
  poster: string;
  showtimes: { [day: string]: string[] };
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Anaconda",
    genre: "Action, Horror, Adventure",
    category: "2D",
    language: "English",
    releaseDate: "2025-01-25",
    poster: "https://image.tmdb.org/t/p/w200/AnKpSxpBVQSMNFkCELMXLfJMoGj.jpg",
    showtimes: {
      "23 Jan": ["01:15pm", "05:30pm"],
      "24 Jan": ["01:15pm", "05:30pm"],
      "25 Jan": ["01:15pm", "05:30pm"],
      "26 Jan": ["01:15pm", "05:30pm"],
      "27 Jan": ["01:15pm", "05:30pm"],
      "28 Jan": ["01:15pm", "05:30pm"],
      "29 Jan": ["01:15pm", "05:30pm"],
    }
  },
  {
    id: 2,
    title: "Avatar: Fire and Ash(2D)",
    genre: "Action, Fantasy, Adventure",
    category: "2D",
    language: "English",
    releaseDate: "2025-12-19",
    poster: "https://image.tmdb.org/t/p/w200/cKtDJiU5zjcnDnRTzYpQ5xScKvU.jpg",
    showtimes: {
      "23 Jan": ["11:00am", "02:45pm"],
      "24 Jan": ["11:00am", "06:30pm"],
      "25 Jan": ["02:45pm", "06:30pm"],
      "26 Jan": ["02:45pm", "06:30pm"],
      "27 Jan": ["11:00am", "02:45pm"],
      "28 Jan": ["11:00am", "02:45pm"],
      "29 Jan": ["02:45pm", "06:30pm"],
    }
  },
  {
    id: 3,
    title: "Avatar: Fire and Ash(3D)",
    genre: "Action, Fantasy, Adventure",
    category: "3D",
    language: "English",
    releaseDate: "2025-12-19",
    poster: "https://image.tmdb.org/t/p/w200/cKtDJiU5zjcnDnRTzYpQ5xScKvU.jpg",
    showtimes: {
      "23 Jan": ["11:30am", "03:15pm"],
      "24 Jan": ["11:30am", "07:00pm"],
      "25 Jan": ["11:30am", "03:15pm"],
      "26 Jan": ["11:30am", "03:15pm"],
      "27 Jan": ["03:15pm", "07:00pm"],
      "28 Jan": ["11:30am", "07:00pm"],
      "29 Jan": ["03:15pm", "07:00pm"],
    }
  },
  {
    id: 4,
    title: "Ekhane Rajnoitik Alap Joruri",
    genre: "Drama",
    category: "2D",
    language: "Bangla",
    releaseDate: "2026-01-16",
    poster: "https://via.placeholder.com/150x220/6B1829/white?text=Bangla+Film",
    showtimes: {
      "23 Jan": ["11:45am", "06:00pm"],
      "24 Jan": ["02:20pm", "07:30pm"],
      "25 Jan": ["11:45am", "02:20pm"],
      "26 Jan": ["11:45am", "05:00pm"],
      "27 Jan": ["02:20pm", "05:00pm"],
      "28 Jan": ["01:45pm", "05:00pm"],
      "29 Jan": ["05:00pm", "07:30pm"],
    }
  },
  {
    id: 5,
    title: "Sultana's Dream",
    genre: "Drama, Animation",
    category: "2D",
    language: "English",
    releaseDate: "2026-01-10",
    poster: "https://via.placeholder.com/150x220/2C3E50/white?text=Sultana%27s+Dream",
    showtimes: {
      "23 Jan": ["12:15pm", "02:30pm"],
      "24 Jan": ["12:15pm", "02:30pm"],
      "25 Jan": ["04:30pm", "07:05pm"],
      "26 Jan": ["12:15pm", "07:30pm"],
      "27 Jan": ["02:30pm", "07:15pm"],
      "28 Jan": ["12:15pm", "04:30pm"],
      "29 Jan": ["12:15pm", "07:00pm"],
    }
  },
  {
    id: 6,
    title: "The SpongeBob Movie: Search for SquarePants",
    genre: "Animation, Comedy, Adventure",
    category: "2D",
    language: "English",
    releaseDate: "2025-12-25",
    poster: "https://via.placeholder.com/150x220/F39C12/white?text=SpongeBob",
    showtimes: {
      "23 Jan": ["11:10am", "03:20pm"],
      "24 Jan": ["11:10am", "03:20pm"],
      "25 Jan": ["11:10am", "03:20pm"],
      "26 Jan": ["11:10am", "03:20pm"],
      "27 Jan": ["11:30am", "03:20pm"],
      "28 Jan": ["05:20pm"],
      "29 Jan": ["11:10am", "03:20pm"],
    }
  },
];

export const DAYS = ["23 Jan", "24 Jan", "25 Jan", "26 Jan", "27 Jan", "28 Jan", "29 Jan"];
export const DAY_LABELS = [
  { date: "23 Jan", day: "Friday" },
  { date: "24 Jan", day: "Saturday" },
  { date: "25 Jan", day: "Sunday" },
  { date: "26 Jan", day: "Monday" },
  { date: "27 Jan", day: "Tuesday" },
  { date: "28 Jan", day: "Wednesday" },
  { date: "29 Jan", day: "Thursday" },
];