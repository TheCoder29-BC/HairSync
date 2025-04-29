import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "../components/Card.module.css"

// 10 echte Barbershop-Bilder von Unsplash (Hair/Barber-Thema)
const dummyShops = [
  {
    id: "1",
    name: "Barber King",
    imageUrl:
      "https://images.unsplash.com/photo-1574913107453-ffd41e352c0f?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "2",
    name: "Classic Cuts",
    imageUrl:
      "https://images.unsplash.com/photo-1596904309695-bd024d5a5016?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "3",
    name: "Urban Fade",
    imageUrl:
      "https://images.unsplash.com/photo-1565479467243-503fed8f8ba4?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "4",
    name: "Retro Shave",
    imageUrl:
      "https://images.unsplash.com/photo-1581387495762-67e23251356f?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "5",
    name: "Gentlemen's Den",
    imageUrl:
      "https://images.unsplash.com/photo-1570974013188-917b34a80b7f?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "6",
    name: "Modern Mane",
    imageUrl:
      "https://images.unsplash.com/photo-1549772035-e5c95c9690a5?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "7",
    name: "The Buzz Stop",
    imageUrl:
      "https://images.unsplash.com/photo-1603214463993-345e45b1f5b1?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "8",
    name: "Fade & Blade",
    imageUrl:
      "https://images.unsplash.com/photo-1593775303675-06f0e682bd71?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "9",
    name: "Sharp Lines",
    imageUrl:
      "https://images.unsplash.com/photo-1590808384032-4dbbf10b8acd?auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "10",
    name: "Clippers Club",
    imageUrl:
      "https://images.unsplash.com/photo-1600185363618-3d04f8aba3d9?auto=format&fit=crop&w=400&h=300",
  },
]

export default function BookAppointment() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Termin buchen</h1>
      <div className={styles.grid}>
        {dummyShops.map((shop) => (
          <div
            key={shop.id}
            className={styles.card}
            onClick={() => navigate(`/book/${shop.id}`)}
          >
            <img src={shop.imageUrl} alt={shop.name} />
            <p>{shop.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
