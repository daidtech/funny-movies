'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import ShareVideo from "../../components/ShareVideo"

const SharedVideo = () => {
  const router = useRouter()

  useEffect(() => {
    if (!Cookies.get('token')) {
      router.replace('/')
    }
  }, [router])

  return (
   <ShareVideo />
  )
}
export default SharedVideo