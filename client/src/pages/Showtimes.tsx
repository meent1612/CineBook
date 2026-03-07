import { useNavigate } from "react-router-dom"
import "../CSSfiles/Showtimes.css"


const MOVIES = [
  {
    id: 1,
    title: "Avatar: Fire and Ash",
    poster: "/posters/avatar.jpg",
    category: "2D",
    genre: "Sci-Fi, Action",
    release: "2025-12-19",
    language: "English",
    showtimes: {
      Mon: ["10:00am", "01:30pm", "05:00pm", "08:30pm"],
      Tue: ["10:00am", "01:30pm", "05:00pm", "08:30pm"],
      Wed: ["11:00am", "02:30pm", "06:00pm"],
      Thu: ["10:00am", "01:30pm", "05:00pm", "08:30pm"],
      Fri: ["10:00am", "01:30pm", "05:00pm", "08:30pm"],
      Sat: ["11:00am", "02:30pm", "06:00pm", "09:30pm"],
      Sun: ["11:00am", "03:00pm", "07:00pm"],
    },
  },
  {
    id: 2,
    title: "Anaconda",
    poster: "/posters/anaconda.jpg",
    category: "2D",
    genre: "Action, Thriller",
    release: "2025-06-04",
    language: "English",
    showtimes: {
      Mon: ["12:00pm", "04:00pm", "08:00pm"],
      Tue: ["12:00pm", "04:00pm", "08:00pm"],
      Wed: ["01:00pm", "05:00pm"],
      Thu: ["12:00pm", "04:00pm", "08:00pm"],
      Fri: ["12:00pm", "04:00pm", "08:00pm"],
      Sat: ["01:00pm", "05:00pm", "09:00pm"],
      Sun: ["01:00pm", "05:00pm"],
    },
  },
  {
    id: 3,
    title: "Ekhane Rajnoitik Alap Joruri",
    poster: "/posters/rajnoitik.jpeg",
    category: "2D",
    genre: "Drama",
    release: "2025-10-01",
    language: "Bangla",
    showtimes: {
      Mon: ["11:00am", "03:00pm", "07:00pm"],
      Tue: ["11:00am", "03:00pm"],
      Wed: ["11:00am", "03:00pm", "07:00pm"],
      Thu: ["11:00am", "03:00pm", "07:00pm"],
      Fri: ["11:00am", "03:00pm", "07:00pm"],
      Sat: ["12:00pm", "04:00pm", "08:00pm"],
      Sun: ["12:00pm", "04:00pm"],
    },
  },
  {
    id: 4,
    title: "Sultana's Dream",
    poster: "/posters/sultana.jpg",
    category: "2D",
    genre: "Fantasy, Drama",
    release: "2025-09-15",
    language: "Bangla",
    showtimes: {
      Mon: ["10:30am", "02:30pm"],
      Tue: ["10:30am", "02:30pm", "06:30pm"],
      Wed: ["10:30am", "02:30pm"],
      Thu: ["10:30am", "02:30pm", "06:30pm"],
      Fri: ["10:30am", "02:30pm", "06:30pm"],
      Sat: ["11:30am", "03:30pm", "07:30pm"],
      Sun: ["11:30am", "03:30pm"],
    },
  },
  {
    id: 5,
    title: "The SpongeBob Movie: Search for SquarePants",
    poster: "/posters/spongebob.jpg",
    category: "2D",
    genre: "Animation, Comedy",
    release: "2025-12-19",
    language: "English",
    showtimes: {
      Mon: ["10:00am", "01:00pm", "04:00pm"],
      Tue: ["10:00am", "01:00pm", "04:00pm"],
      Wed: ["10:00am", "01:00pm"],
      Thu: ["10:00am", "01:00pm", "04:00pm"],
      Fri: ["10:00am", "01:00pm", "04:00pm"],
      Sat: ["10:00am", "01:00pm", "04:00pm", "07:00pm"],
      Sun: ["11:00am", "02:00pm", "05:00pm"],
    },
  },
]

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return {
    key:  DAY_NAMES[d.getDay()] as keyof (typeof MOVIES)[0]["showtimes"],
    day:  DAY_NAMES[d.getDay()],
    date: String(d.getDate()).padStart(2, "0"),
  }
})

const BACKEND = import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:8000"
const FALLBACK_COLORS = ["#4e0f1a","#1a3a5c","#1a4d2e","#3b1f5e","#7a3b00"]

function Poster({ title, url }: { title: string; url: string }) {
  const src = url.startsWith("/") ? `${BACKEND}${url}` : url
  const bg  = FALLBACK_COLORS[title.charCodeAt(0) % FALLBACK_COLORS.length]

  return (
    <img
      src={src}
      alt={title}
      className="movie-info-poster"
      onError={e => {
        const el = e.target as HTMLImageElement
        el.style.display = "none"
        const fallback = el.nextSibling as HTMLElement
        if (fallback) fallback.style.display = "flex"
      }}
    />
  )
}

export default function ShowTimes() {
  const navigate = useNavigate()

  return (
    <div className="showtimes-wrapper">

      
      <div className="location-bar">
        <div>
          <div className="location-label">Weekly Showtime</div>
          <div className="location-name">
            <i className="fa-solid fa-location-dot" /> Love Road, Tejgaon
          </div>
        </div>
        <button className="change-location-btn">
          <i className="fa-solid fa-rotate" /> Change Location
        </button>
      </div>

      
      <div className="movie-rows">
        {MOVIES.map(movie => (
          <div key={movie.id} className="movie-row">
            <div className="movie-row-inner">

              
              <div className="movie-info">
                <div style={{ position: "relative" }}>
                  <Poster title={movie.title} url={movie.poster} />
                  <div
                    className="poster-thumb-fallback"
                    style={{ background: FALLBACK_COLORS[movie.title.charCodeAt(0) % FALLBACK_COLORS.length], display: "none" }}
                  >
                    <i className="fa-solid fa-film" />
                  </div>
                </div>
                <div>
                  <div className="movie-info-title">{movie.title}</div>
                  <div className="movie-info-details">
                    <div><i className="fa-solid fa-layer-group" /> {movie.category}</div>
                    <div><i className="fa-solid fa-masks-theater" /> {movie.genre}</div>
                    <div><i className="fa-solid fa-calendar-days" /> {movie.release}</div>
                    <div><i className="fa-solid fa-language" /> {movie.language}</div>
                  </div>
                </div>
              </div>

              
              <div className="showtimes-grid-wrapper">
                <div className="showtimes-grid">
                  {WEEK_DAYS.map(({ key, day, date }) => {
                    const slots = movie.showtimes[key] || []
                    return (
                      <div key={day + date} className="day-column">
                        <div className="day-header">
                          <div className="day-date">{date}</div>
                          <div className="day-name">{day}</div>
                        </div>

                        {slots.length === 0 ? (
                          <div className="no-show">—</div>
                        ) : (
                          slots.map(time => (
                            <button key={time} className="showtime-btn">
                              <i className="fa-regular fa-clock" /> {time}
                            </button>
                          ))
                        )}

                        {slots.length > 0 && (
                          <button
                            className="get-tickets-btn"
                            onClick={() => navigate(`/book/${movie.id}`)}
                          >
                            <i className="fa-solid fa-ticket" /> Get Tickets
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      <div className="footer">
        Copyright© 2026 CineBook Limited. All Rights Reserved.
      </div>
    </div>
  )
}