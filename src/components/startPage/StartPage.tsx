import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './StartPage.css'

const StartPage: React.FC = () => {
  const textRef = useRef<HTMLHeadingElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [buttonVisible, setButtonVisible] = useState(false)

  useEffect(() => {
    if (!textRef.current || !buttonRef.current) return

    const textElement = textRef.current

    if (!textElement.dataset.originalText) {
      textElement.dataset.originalText = textElement.innerText
    }

    const words = textElement.dataset.originalText.split(' ')
    textElement.innerHTML = words
      .map((word) => `<span class="word">${word} </span>`)
      .join('')

    const tl = gsap.timeline({ repeat: -1 })

    tl.fromTo(
      '.word',
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power1.inOut',
        onComplete: () => {
          if (!buttonVisible) {
            setButtonVisible(true)
          }
        },
      }
    )

    return () => {
      tl.kill()
    }
  }, [buttonVisible])

  useEffect(() => {
    if (buttonVisible && buttonRef.current) {
      gsap.to(buttonRef.current, {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      })
    }
  }, [buttonVisible])

  return (
    <div className="start-page">
      <h3 ref={textRef} className="typing-effect">
        "Welcome to the future of communication. A real-time chat built for the
        cyber age. Secure, fast, and always online. Whether you're here to
        connect, strategize, or just talk, you're in the right place. No delays.
        No limits. Just instant conversations."
      </h3>
      <NavLink to="/login">
        <button ref={buttonRef} className="start-button" style={{ opacity: 0 }}>
          Explore
        </button>
      </NavLink>
    </div>
  )
}

export default StartPage
